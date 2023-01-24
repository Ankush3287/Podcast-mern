import { useEffect, useRef, useCallback } from "react";
import { ACTIONS } from "../actions";
import { socketInit } from "../socket";
import freeice from "freeice";
import { useStateWithCallback } from "./useStateWithCallback";

export const useWebRTC = (roomId, user) => {
  const [clients, setClients] = useStateWithCallback([]);
  const audioElements = useRef({});
  const connections = useRef({});
  const socket = useRef(null);
  const localMediaStream = useRef(null);
  const clientsRef = useRef(null);

  const addNewClient = useCallback(
    (newClient, cb) => {
      const lookingFor = clients.find((client) => client._id === newClient._id);

      if (lookingFor === undefined) {
        setClients((existingClients) => [...existingClients, newClient], cb);
      }
    },
    [clients, setClients]
  );

  useEffect(() => {
    clientsRef.current = clients;
  }, [clients]);

  useEffect(() => {
    const initChat = async () => {
      socket.current = socketInit();
      await captureMedia();
      addNewClient({ ...user, muted: true }, () => {
        const localElement = audioElements.current[user.id];
        if (localElement) {
          localElement.volume = 0;
          localElement.srcObject = localMediaStream.current;
        }
      });
      socket.current.on(ACTIONS.MUTE_INFO, ({ userId, isMute }) => {
        handleSetMute(isMute, userId);
      });

      socket.current.on(ACTIONS.ADD_PEER, handleNewPeer);
      socket.current.on(ACTIONS.REMOVE_PEER, handleRemovePeer);
      socket.current.on(ACTIONS.ICE_CANDIDATE, handleIceCandidate);
      socket.current.on(ACTIONS.SESSION_DESCRIPTION, setRemoteMedia);
      socket.current.on(ACTIONS.MUTE, ({ peerId, userId }) => {
        handleSetMute(true, userId);
      });
      socket.current.on(ACTIONS.UN_MUTE, ({ peerId, userId }) => {
        handleSetMute(false, userId);
      });
      socket.current.emit(ACTIONS.JOIN, {
        roomId,
        user,
      });

      /**Audio Capture */
      async function captureMedia() {
        // Start capturing local audio stream.
        localMediaStream.current = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
      }
      async function handleNewPeer({ peerId, createOffer, user: remoteUser }) {
        if (peerId in connections.current) {
          return console.warn(
            `You are already connected with ${peerId} (${user.name})`
          );
        }

        // Store it to connections
        connections.current[peerId] = new RTCPeerConnection({
          iceServers: freeice(),
        });

        // Handle new ice candidate on this peer connection
        connections.current[peerId].onicecandidate = (event) => {
          socket.current.emit(ACTIONS.RELAY_ICE, {
            peerId,
            icecandidate: event.candidate,
          });
        };

        // Handle on track event on this connection
        connections.current[peerId].ontrack = ({ streams: [remoteStream] }) => {
          addNewClient({ ...remoteUser, muted: true }, () => {
            // get current users mute info
            const currentUser = clientsRef.current.find(
              (client) => client._id === user._id
            );
            if (currentUser) {
              socket.current.emit(ACTIONS.MUTE_INFO, {
                userId: user._id,
                roomId,
                isMute: currentUser.muted,
              });
            }
            if (audioElements.current[remoteUser._id]) {
              audioElements.current[remoteUser._id].srcObject = remoteStream;
            } else {
              let settled = false;
              const interval = setInterval(() => {
                if (audioElements.current[remoteUser._id]) {
                  audioElements.current[remoteUser._id].srcObject =
                    remoteStream;
                  settled = true;
                }

                if (settled) {
                  clearInterval(interval);
                }
              }, 300);
            }
          });
        };

        // Add connection to peer connections track
        localMediaStream.current.getTracks().forEach((track) => {
          connections.current[peerId].addTrack(track, localMediaStream.current);
        });

        // Create an offer if required
        if (createOffer) {
          const offer = await connections.current[peerId].createOffer();

          // Set as local description
          await connections.current[peerId].setLocalDescription(offer);

          // send offer to the server
          socket.current.emit(ACTIONS.RELAY_SDP, {
            peerId,
            sessionDescription: offer,
          });
        }
      }

      /**Remove Peer */
      async function handleRemovePeer({ peerId, userId }) {
        if (connections.current[peerId]) {
          connections.current[peerId].close();
        }

        delete connections.current[peerId];
        delete audioElements.current[peerId];
        setClients((list) => list.filter((client) => client._id !== userId));
      }

      /**Handle ice candidate */
      async function handleIceCandidate({ peerId, icecandidate }) {
        if (icecandidate) {
          connections.current[peerId].addIceCandidate(icecandidate);
        }
      }

      /**Session Description */
      async function setRemoteMedia({
        peerId,
        sessionDescription: remoteSessionDescription,
      }) {
        connections.current[peerId].setRemoteDescription(
          new RTCSessionDescription(remoteSessionDescription)
        );

        // If session descrition is offer then create an answer
        if (remoteSessionDescription.type === "offer") {
          const connection = connections.current[peerId];

          const answer = await connection.createAnswer();
          connection.setLocalDescription(answer);

          socket.current.emit(ACTIONS.RELAY_SDP, {
            peerId,
            sessionDescription: answer,
          });
        }
      }

      /**Handling Mute */
      async function handleSetMute(mute, userId) {
        const clientIdx = clientsRef.current
          .map((client) => client._id)
          .indexOf(userId);
        const allConnectedClients = JSON.parse(
          JSON.stringify(clientsRef.current)
        );
        if (clientIdx > -1) {
          allConnectedClients[clientIdx].muted = mute;
          setClients(allConnectedClients);
        }
      }
    };

    initChat();

    /**Cleanup function */
    return () => {
      localMediaStream.current.getTracks().forEach((track) => track.stop());
      socket.current.emit(ACTIONS.LEAVE, { roomId });
      for (let peerId in connections.current) {
        connections.current[peerId].close();
        delete connections.current[peerId];
        delete audioElements.current[peerId];
      }
      socket.current.off(ACTIONS.ADD_PEER);
      socket.current.off(ACTIONS.REMOVE_PEER);
      socket.current.off(ACTIONS.ICE_CANDIDATE);
      socket.current.off(ACTIONS.SESSION_DESCRIPTION);
      socket.current.off(ACTIONS.MUTE);
      socket.current.off(ACTIONS.UN_MUTE);
    };
  }, []);

  const provideRef = (instance, userId) => {
    audioElements.current[userId] = instance;
  };

  const handleMute = (isMute, userId) => {
    let settled = false;

    if (userId === user._id) {
      let interval = setInterval(() => {
        if (localMediaStream.current) {
          localMediaStream.current.getTracks()[0].enabled = !isMute;
          if (isMute) {
            socket.current.emit(ACTIONS.MUTE, {
              roomId,
              userId: user._id,
            });
          } else {
            socket.current.emit(ACTIONS.UN_MUTE, {
              roomId,
              userId: user._id,
            });
          }
          settled = true;
        }
        if (settled) {
          clearInterval(interval);
        }
      }, 200);
    }
  };

  return {
    clients,
    provideRef,
    handleMute,
  };
};
