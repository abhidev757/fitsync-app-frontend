import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Peer from 'simple-peer/simplepeer.min.js';
import { getUserSocket, connectUserSocket } from '../util/userSocket'; 
import { getTrainerSocket, connectTrainerSocket } from '../util/trainerSocket';
import { toast } from 'react-toastify';
import { Socket } from 'socket.io-client';

// Simple-peer compatibility for Vite/Modern Browsers
if (typeof window.global === 'undefined') {
  window.global = window;
}

interface JoinPayload {
  fromSocketId: string;
  userId: string;
  name: string;
  role: string;
}

interface SignalPayload {
  fromSocketId: string;
  signal: Peer.SignalData;
  fromName?: string;
  role?: string;
}

interface PeerState {
  peerId: string;
  peer: Peer.Instance;
  stream: MediaStream;
  name: string;
  role: string;
}

const VideoCall: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { role?: string, name?: string } | null;
  
  const [socket, setSocket] = useState<Socket | null>(null);
  const [peers, setPeers] = useState<PeerState[]>([]);
  const [pinnedPeerId, setPinnedPeerId] = useState<string | null>(null);
  
  const peersRef = useRef<PeerState[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const hasJoined = useRef(false);

  // Determine local user details
  const isTrainerFallback = !!localStorage.getItem("trainerId");
  const localRole = state?.role || (isTrainerFallback ? "trainer" : "user");
  const localName = state?.name || localStorage.getItem("userName") || (localRole === 'trainer' ? "Trainer" : "User");

  // 1. Handle Socket Initialization & Reconnection
  useEffect(() => {
    let activeSocket = getUserSocket() || getTrainerSocket();

    if (!activeSocket) {
      console.log("⚠️ Socket missing, checking credentials...");
      const trainerId = localStorage.getItem('trainerId');
      const userId = localStorage.getItem('userId');

      if (trainerId) {
        activeSocket = connectTrainerSocket(trainerId);
      } else if (userId) {
        activeSocket = connectUserSocket(userId);
      }
    }

    if (activeSocket) {
      console.log("🟢 Socket set in state:", activeSocket.id);
      setSocket(activeSocket);
    } else {
      toast.error("Auth session lost. Please log in again.");
      navigate('/');
    }
  }, [navigate]);

  // 2. WebRTC Signaling Logic
  useEffect(() => {
    if (!socket || !sessionId) return;

    const currentSocket = socket;
    const currentPeers = peersRef.current;

    const updatePeerStream = (id: string, peer: Peer.Instance, remoteStream: MediaStream, name: string = "Participant", role: string = "user") => {
      console.log("🎬 Setting remote stream for:", id, "Name:", name, "Role:", role);
      setPeers(prev => {
        const filtered = prev.filter(p => p.peerId !== id);
        return [...filtered, { peerId: id, peer, stream: remoteStream, name, role }];
      });
    };

    const createPeer = (userToSignal: string, stream: MediaStream, remoteName: string, remoteRole: string): Peer.Instance => {
      console.log("📡 Creating initiator peer for:", userToSignal);
      
      const peer = new Peer({ 
        initiator: true, 
        trickle: false, 
        stream: stream 
      });

      peer.on("signal", (signal: Peer.SignalData) => {
        console.log("📤 Sending signal to:", userToSignal);
        currentSocket.emit("send-signal", { 
          toSocketId: userToSignal, 
          signal,
          fromName: localName,
          role: localRole
        });
      });

      peer.on("stream", (remoteStream: MediaStream) => {
        updatePeerStream(userToSignal, peer, remoteStream, remoteName, remoteRole);
      });

      peer.on("error", (err) => console.error("Peer Error:", err));

      return peer;
    };

    const addPeer = (incomingSignal: Peer.SignalData, callerId: string, stream: MediaStream, remoteName: string, remoteRole: string): Peer.Instance => {
      const peer = new Peer({ initiator: false, trickle: false, stream });
      peer.on("signal", (signal: Peer.SignalData) => {
        currentSocket.emit("return-signal", { toSocketId: callerId, signal });
      });
      peer.on("stream", (remoteStream: MediaStream) => {
        updatePeerStream(callerId, peer, remoteStream, remoteName, remoteRole);
      });
      peer.signal(incomingSignal);
      return peer;
    };

    const initializeCall = (stream: MediaStream) => {
      if (hasJoined.current) return;
      hasJoined.current = true;

      console.log("📤 Emitting join-video-room:", sessionId);
      currentSocket.emit("join-video-room", { 
        sessionId, 
        userId: localStorage.getItem("userId") || localStorage.getItem("trainerId"), 
        name: localName,
        role: localRole
      });

      currentSocket.on("user-joined", (payload: JoinPayload) => {
        console.log("👤 Someone joined:", payload.fromSocketId, payload.name, payload.role);
        const peer = createPeer(payload.fromSocketId, stream, payload.name, payload.role);
        currentPeers.push({ peerId: payload.fromSocketId, peer, stream: new MediaStream(), name: payload.name, role: payload.role });
      });

      currentSocket.on("receive-signal", (payload: SignalPayload) => {
        console.log("📥 Received offer from:", payload.fromSocketId);
        const remoteName = payload.fromName || "Participant";
        const remoteRole = payload.role || "user";
        const peer = addPeer(payload.signal, payload.fromSocketId, stream, remoteName, remoteRole);
        currentPeers.push({ peerId: payload.fromSocketId, peer, stream: new MediaStream(), name: remoteName, role: remoteRole });
      });

      currentSocket.on("receiving-returned-signal", (payload: SignalPayload) => {
        console.log("📤 Handshake finalized with:", payload.fromSocketId);
        const item = currentPeers.find(p => p.peerId === payload.fromSocketId);
        if (item) item.peer.signal(payload.signal);
      });
    };

    // Get Media
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((stream) => {
        streamRef.current = stream;

        if (currentSocket.connected) {
          initializeCall(stream);
        } else {
          currentSocket.on("connect", () => initializeCall(stream));
        }
      })
      .catch(err => {
        console.error("Media Error:", err);
        toast.error("Camera access required for video calls.");
      });

    return () => {
      console.log("🧹 Cleanup triggered");
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      currentSocket.off("user-joined");
      currentSocket.off("receive-signal");
      currentSocket.off("receiving-returned-signal");
      currentSocket.off("connect");
      currentPeers.forEach(p => p.peer.destroy());
      hasJoined.current = false;
    };
  }, [socket, sessionId]);

  if (!socket) {
    return (
      <div className="h-screen bg-black flex items-center justify-center text-[#d9ff00]">
        Connecting to signaling server...
      </div>
    );
  }

  const handlePin = (id: string) => {
    setPinnedPeerId(prev => (prev === id ? null : id));
  };

  // Determine which layout to show
  const isGridView = localRole === "trainer" && !pinnedPeerId;

  interface ParticipantView {
    id: string;
    name: string;
    role: string;
    isLocal: boolean;
    stream: MediaStream | null;
  }

  // For Spotlight view, determine who gets the main stage
  let spotlightPeer: ParticipantView | null = null;
  
  const allParticipants: ParticipantView[] = [
    { id: "local", name: `${localName} (You)`, role: localRole, isLocal: true, stream: streamRef.current },
    ...peers.map(p => ({ id: p.peerId, name: p.name, role: p.role, isLocal: false, stream: p.stream }))
  ];

  if (!isGridView) {
    if (pinnedPeerId) {
      spotlightPeer = allParticipants.find(p => p.id === pinnedPeerId) || null;
    }
    if (!spotlightPeer) {
      // Default spotlight is the trainer
      spotlightPeer = allParticipants.find(p => p.role === "trainer") || allParticipants[0];
    }
  }

  // Those who are not in spotlight
  const thumbnails = isGridView ? allParticipants : allParticipants.filter(p => p.id !== (spotlightPeer?.id));

  return (
    <div className="flex flex-col h-screen bg-[#0f0f0f] p-4 overflow-hidden">
      
      {isGridView ? (
        // Client Monitoring View (Trainer Default Grid)
        <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-4 flex-1 auto-rows-[minmax(200px,1fr)] overflow-y-auto pr-2 pb-4 pt-2">
          {thumbnails.map(p => (
            <div 
              key={p.id} 
              onClick={() => handlePin(p.id)}
              className="relative bg-gray-900 rounded-2xl overflow-hidden border-2 border-gray-800 shadow-xl cursor-pointer hover:border-[#d9ff00] transition-colors group"
            >
              <VideoItem stream={p.stream!} isLocal={p.isLocal} />
              <div className="absolute bottom-4 left-4 bg-black/60 px-3 py-1 rounded text-white text-sm backdrop-blur-sm group-hover:text-[#d9ff00]">
                {p.name} {p.role === "trainer" && "👑"}
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Trainer View / Spotlight Layout (Client Default)
        <div className="flex flex-col md:flex-row gap-4 flex-1 min-h-0">
          
          {/* Main Spotlight Video (70% width on Desktop) */}
          <div 
            onClick={() => handlePin(spotlightPeer!.id)}
            className="relative flex-grow md:w-[70%] bg-gray-900 rounded-2xl overflow-hidden border-2 border-[#d9ff00] shadow-[0_0_15px_rgba(217,255,0,0.2)] cursor-pointer"
          >
            {spotlightPeer && <VideoItem stream={spotlightPeer.stream!} isLocal={spotlightPeer.isLocal} layoutClass="w-full h-full object-contain" />}
            <div className="absolute bottom-6 left-6 bg-black/70 px-4 py-2 rounded-lg text-white font-medium backdrop-blur-md border border-gray-700">
              {spotlightPeer?.name} {spotlightPeer?.role === "trainer" && "👑"}
            </div>
            {pinnedPeerId === spotlightPeer?.id && (
              <div className="absolute top-6 right-6 bg-black/70 px-3 py-1.5 rounded text-[#d9ff00] text-xs font-bold uppercase tracking-wider">
                Pinned 📌
              </div>
            )}
          </div>

          {/* Side/Bottom Thumbnails */}
          <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto md:w-[30%] shrink-0 pb-2 md:pb-0 md:pr-2 snap-x md:snap-y">
            {thumbnails.map(p => (
              <div 
                key={p.id}
                onClick={() => handlePin(p.id)}
                className="relative bg-gray-900 rounded-xl overflow-hidden border-2 border-gray-800 shadow-lg cursor-pointer hover:border-gray-500 transition-colors w-40 md:w-full h-28 md:h-48 shrink-0 snap-start group"
              >
                <VideoItem stream={p.stream!} isLocal={p.isLocal} />
                <div className="absolute bottom-2 left-2 bg-black/70 px-2 py-1 rounded text-white text-xs backdrop-blur-sm truncate max-w-[90%]">
                  {p.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="h-20 shrink-0 flex items-center justify-center mt-4">
        <button 
          onClick={() => navigate(-1)}
          className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-12 rounded-full transition-all hover:scale-105 shadow-lg border-2 border-red-400/30"
        >
          End Call
        </button>
      </div>
    </div>
  );
};

const VideoItem = ({ stream, isLocal = false, layoutClass = "w-full h-full object-cover" }: { stream: MediaStream | null, isLocal?: boolean, layoutClass?: string }) => {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    if (ref.current && stream) ref.current.srcObject = stream;
  }, [stream]);
  return (
    <video 
      ref={ref} 
      autoPlay 
      playsInline 
      muted={isLocal} 
      className={`${layoutClass} ${isLocal ? 'scale-x-[-1]' : ''}`} 
    />
  );
};

export default VideoCall;