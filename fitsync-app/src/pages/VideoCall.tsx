import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
}

interface SignalPayload {
  fromSocketId: string;
  signal: Peer.SignalData;
}

interface PeerState {
  peerId: string;
  peer: Peer.Instance;
  stream: MediaStream;
}

const VideoCall: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  
  const [socket, setSocket] = useState<Socket | null>(null);
  const [peers, setPeers] = useState<PeerState[]>([]);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const peersRef = useRef<PeerState[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const hasJoined = useRef(false);

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

    const updatePeerStream = (id: string, peer: Peer.Instance, remoteStream: MediaStream) => {
      console.log("🎬 Setting remote stream for:", id);
      setPeers(prev => {
        const filtered = prev.filter(p => p.peerId !== id);
        return [...filtered, { peerId: id, peer, stream: remoteStream }];
      });
    };

    const createPeer = (userToSignal: string, stream: MediaStream): Peer.Instance => {
  console.log("📡 Creating initiator peer for:", userToSignal);
  
  // Ensure we are using the constructor correctly with 'new'
  const peer = new Peer({ 
    initiator: true, 
    trickle: false, 
    stream: stream 
  });

  peer.on("signal", (signal: Peer.SignalData) => {
    console.log("📤 Sending signal to:", userToSignal);
    currentSocket.emit("send-signal", { toSocketId: userToSignal, signal });
  });

  peer.on("stream", (remoteStream: MediaStream) => {
    updatePeerStream(userToSignal, peer, remoteStream);
  });

  // Handle potential peer errors to prevent crashes
  peer.on("error", (err) => console.error("Peer Error:", err));

  return peer;
};

    const addPeer = (incomingSignal: Peer.SignalData, callerId: string, stream: MediaStream): Peer.Instance => {
      const peer = new Peer({ initiator: false, trickle: false, stream });
      peer.on("signal", (signal: Peer.SignalData) => {
        currentSocket.emit("return-signal", { toSocketId: callerId, signal });
      });
      peer.on("stream", (remoteStream: MediaStream) => {
        updatePeerStream(callerId, peer, remoteStream);
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
        userId: localStorage.getItem("userId"), 
        name: localStorage.getItem("userName") || "User" 
      });

      currentSocket.on("user-joined", (payload: JoinPayload) => {
        console.log("👤 Someone joined:", payload.fromSocketId);
        const peer = createPeer(payload.fromSocketId, stream);
        currentPeers.push({ peerId: payload.fromSocketId, peer, stream: new MediaStream() });
      });

      currentSocket.on("receive-signal", (payload: SignalPayload) => {
        console.log("📥 Received offer from:", payload.fromSocketId);
        const peer = addPeer(payload.signal, payload.fromSocketId, stream);
        currentPeers.push({ peerId: payload.fromSocketId, peer, stream: new MediaStream() });
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
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;

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

  return (
    <div className="flex flex-col h-screen bg-[#0f0f0f] p-4 overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
        {/* Local Feed */}
        <div className="relative bg-gray-900 rounded-2xl overflow-hidden border-2 border-[#d9ff00] shadow-xl">
          <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-full object-cover scale-x-[-1]" />
          <div className="absolute bottom-4 left-4 bg-black/60 px-3 py-1 rounded text-[#d9ff00] text-sm">You</div>
        </div>

        {/* Remote Feeds */}
        {peers.map((peerObj) => (
          <div key={peerObj.peerId} className="relative bg-gray-900 rounded-2xl overflow-hidden border border-gray-800 shadow-xl">
            <VideoItem stream={peerObj.stream} />
            <div className="absolute bottom-4 left-4 bg-black/60 px-3 py-1 rounded text-white text-sm">Participant</div>
          </div>
        ))}
      </div>
      
      <div className="h-24 flex items-center justify-center gap-6">
        <button 
          onClick={() => navigate(-1)}
          className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-12 rounded-full transition-all hover:scale-105 shadow-lg"
        >
          End Call
        </button>
      </div>
    </div>
  );
};

const VideoItem = ({ stream }: { stream: MediaStream }) => {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.srcObject = stream;
  }, [stream]);
  return <video ref={ref} autoPlay playsInline className="w-full h-full object-cover" />;
};

export default VideoCall;