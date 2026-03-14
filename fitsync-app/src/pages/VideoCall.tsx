import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Peer from 'simple-peer/simplepeer.min.js';
import { getUserSocket, connectUserSocket } from '../util/userSocket'; 
import { getTrainerSocket, connectTrainerSocket } from '../util/trainerSocket';
import { toast } from 'react-toastify';
import { Socket } from 'socket.io-client';
import { PhoneOff, User, Crown } from 'lucide-react';

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

interface ParticipantView {
  id: string;
  name: string;
  role: string;
  isLocal: boolean;
  stream: MediaStream | null;
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

  const isTrainerFallback = !!localStorage.getItem("trainerId");
  const localRole = state?.role || (isTrainerFallback ? "trainer" : "user");
  const localName = state?.name || localStorage.getItem("userName") || (localRole === 'trainer' ? "Trainer" : "User");

  useEffect(() => {
    let activeSocket = getUserSocket() || getTrainerSocket();
    if (!activeSocket) {
      const trainerId = localStorage.getItem('trainerId');
      const userId = localStorage.getItem('userId');
      if (trainerId) activeSocket = connectTrainerSocket(trainerId);
      else if (userId) activeSocket = connectUserSocket(userId);
    }

    if (activeSocket) setSocket(activeSocket);
    else {
      toast.error("Auth session lost.");
      navigate('/');
    }
  }, [navigate]);

  useEffect(() => {
    if (!socket || !sessionId) return;
    const currentSocket = socket;
    const currentPeers = peersRef.current;

    const updatePeerStream = (id: string, peer: Peer.Instance, remoteStream: MediaStream, name: string, role: string) => {
      setPeers(prev => {
        const filtered = prev.filter(p => p.peerId !== id);
        return [...filtered, { peerId: id, peer, stream: remoteStream, name, role }];
      });
    };

    const createPeer = (userToSignal: string, stream: MediaStream, remoteName: string, remoteRole: string): Peer.Instance => {
      const peer = new Peer({ initiator: true, trickle: false, stream });
      peer.on("signal", (signal: Peer.SignalData) => {
        currentSocket.emit("send-signal", { toSocketId: userToSignal, signal, fromName: localName, role: localRole });
      });
      peer.on("stream", (remoteStream: MediaStream) => updatePeerStream(userToSignal, peer, remoteStream, remoteName, remoteRole));
      return peer;
    };

    const addPeer = (incomingSignal: Peer.SignalData, callerId: string, stream: MediaStream, remoteName: string, remoteRole: string): Peer.Instance => {
      const peer = new Peer({ initiator: false, trickle: false, stream });
      peer.on("signal", (signal: Peer.SignalData) => currentSocket.emit("return-signal", { toSocketId: callerId, signal }));
      peer.on("stream", (remoteStream: MediaStream) => updatePeerStream(callerId, peer, remoteStream, remoteName, remoteRole));
      peer.signal(incomingSignal);
      return peer;
    };

    const initializeCall = (stream: MediaStream) => {
      if (hasJoined.current) return;
      hasJoined.current = true;
      currentSocket.emit("join-video-room", { sessionId, userId: localStorage.getItem("userId") || localStorage.getItem("trainerId"), name: localName, role: localRole });

      currentSocket.on("user-joined", (payload: JoinPayload) => {
        const peer = createPeer(payload.fromSocketId, stream, payload.name, payload.role);
        currentPeers.push({ peerId: payload.fromSocketId, peer, stream: new MediaStream(), name: payload.name, role: payload.role });
      });

      currentSocket.on("receive-signal", (payload: SignalPayload) => {
        const peer = addPeer(payload.signal, payload.fromSocketId, stream, payload.fromName || "Participant", payload.role || "user");
        currentPeers.push({ peerId: payload.fromSocketId, peer, stream: new MediaStream(), name: payload.fromName || "Participant", role: payload.role || "user" });
      });

      currentSocket.on("receiving-returned-signal", (payload: SignalPayload) => {
        const item = currentPeers.find(p => p.peerId === payload.fromSocketId);
        if (item) item.peer.signal(payload.signal);
      });
    };

    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((stream) => {
        streamRef.current = stream;
        if (currentSocket.connected) initializeCall(stream);
        else currentSocket.on("connect", () => initializeCall(stream));
      })
      .catch(() => toast.error("Camera/Mic access required."));

    return () => {
      if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
      currentSocket.off("user-joined");
      currentSocket.off("receive-signal");
      currentSocket.off("receiving-returned-signal");
      currentPeers.forEach(p => p.peer.destroy());
      hasJoined.current = false;
    };
  }, [socket, sessionId, localName, localRole]);

  const handlePin = (id: string) => setPinnedPeerId(prev => (prev === id ? null : id));

  const allParticipants: ParticipantView[] = [
    { id: "local", name: localName, role: localRole, isLocal: true, stream: streamRef.current },
    ...peers.map(p => ({ id: p.peerId, name: p.name, role: p.role, isLocal: false, stream: p.stream }))
  ];

  const isGridView = localRole === "trainer" && !pinnedPeerId;
  let spotlightPeer = pinnedPeerId ? allParticipants.find(p => p.id === pinnedPeerId) : (allParticipants.find(p => p.role === "trainer") || allParticipants[0]);
  if (!spotlightPeer) spotlightPeer = allParticipants[0];

  const thumbnails = isGridView ? allParticipants : allParticipants.filter(p => p.id !== spotlightPeer?.id);

  if (!socket) return <div className="h-screen bg-black flex items-center justify-center text-[#CCFF00] animate-pulse uppercase font-black tracking-widest">Establishing Secure Link...</div>;

  return (
    <div className="flex flex-col h-[100dvh] bg-[#050505] text-white overflow-hidden font-sans">
      
      <main className="flex-1 relative flex flex-col md:flex-row p-2 md:p-4 gap-2 md:gap-4 min-h-0">
        {isGridView ? (
          /* GRID VIEW - Optimal for Trainers on Desktop/Tablet */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 w-full h-full overflow-y-auto content-start pb-20 md:pb-4">
            {allParticipants.map(p => (
              <div key={p.id} onClick={() => handlePin(p.id)} className="relative aspect-video bg-gray-900 rounded-xl overflow-hidden border border-gray-800 group cursor-pointer hover:border-[#CCFF00] transition-all">
                <VideoItem stream={p.stream} isLocal={p.isLocal} />
                <div className="absolute bottom-2 left-2 flex items-center gap-2 bg-black/60 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-tight backdrop-blur-md">
                  {p.role === 'trainer' && <Crown size={12} className="text-[#CCFF00]" />}
                  {p.name} {p.isLocal && "(You)"}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* SPOTLIGHT VIEW - Optimal for Clients or Pinned Participants */
          <>
            <div className="flex-1 relative bg-gray-900 rounded-2xl overflow-hidden border border-gray-800 shadow-2xl min-h-0">
              <VideoItem stream={spotlightPeer?.stream} isLocal={spotlightPeer?.isLocal} layoutClass="w-full h-full object-cover md:object-contain" />
              
              <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-full backdrop-blur-xl border border-white/10">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest">{sessionId?.slice(0, 8)} // LIVE</span>
              </div>

              <div className="absolute bottom-4 left-4 bg-black/60 px-4 py-2 rounded-xl backdrop-blur-md border border-gray-700 flex items-center gap-2">
                {spotlightPeer?.role === 'trainer' && <Crown size={16} className="text-[#CCFF00]" />}
                <span className="font-black uppercase italic tracking-tighter text-sm md:text-lg">{spotlightPeer?.name}</span>
              </div>
            </div>

            {/* THUMBNAILS - Horizontal on Mobile, Vertical on Desktop */}
            <aside className="flex md:flex-col gap-2 overflow-x-auto md:overflow-y-auto md:w-64 lg:w-80 shrink-0 scrollbar-hide snap-x md:snap-y pb-20 md:pb-0">
              {thumbnails.map(p => (
                <div key={p.id} onClick={() => handlePin(p.id)} className="relative aspect-video w-40 md:w-full shrink-0 bg-gray-900 rounded-xl overflow-hidden border border-gray-800 cursor-pointer snap-start group active:scale-95 transition-transform">
                  <VideoItem stream={p.stream} isLocal={p.isLocal} />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                  <div className="absolute bottom-2 left-2 bg-black/70 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-tighter backdrop-blur-sm truncate max-w-[80%]">
                    {p.name}
                  </div>
                </div>
              ))}
            </aside>
          </>
        )}
      </main>

      {/* FOOTER CONTROLS - Fixed at bottom */}
      <footer className="h-20 bg-gradient-to-t from-black to-transparent shrink-0 flex items-center justify-center px-6 absolute bottom-0 w-full z-50 pointer-events-none">
        <div className="flex items-center gap-4 pointer-events-auto">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-3 bg-red-600 hover:bg-red-700 text-white font-black uppercase text-xs tracking-widest py-3.5 px-8 md:px-12 rounded-full transition-all shadow-[0_0_20px_rgba(220,38,38,0.4)] active:scale-90"
          >
            <PhoneOff size={18} />
            <span className="hidden sm:inline">Terminate Call</span>
          </button>
        </div>
      </footer>
    </div>
  );
};

const VideoItem = ({ stream, isLocal = false, layoutClass = "w-full h-full object-cover" }: { stream: MediaStream | null, isLocal?: boolean, layoutClass?: string }) => {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    if (ref.current && stream) ref.current.srcObject = stream;
  }, [stream]);

  return (
    <div className="w-full h-full bg-[#111]">
      {stream ? (
        <video 
          ref={ref} 
          autoPlay 
          playsInline 
          muted={isLocal} 
          className={`${layoutClass} ${isLocal ? 'scale-x-[-1]' : ''}`} 
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center gap-2">
          <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center animate-pulse">
            <User className="text-gray-600" />
          </div>
          <span className="text-[8px] font-black text-gray-700 uppercase tracking-widest">Connecting Data...</span>
        </div>
      )}
    </div>
  );
};

export default VideoCall;