import React, { useEffect, useRef, useState } from 'react';
import './CapturaFacial.css';

export default function CapturaFacial() {
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [statusMessage, setStatusMessage] = useState('Iniciando cámara...');

  // Función para activar la cámara automáticamente al montar el componente (al iniciar sesión)
  useEffect(() => {
    const iniciarCamara = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } }
        });
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
        setStream(mediaStream);
        setStatusMessage('Coloca tu rostro dentro del círculo');
      } catch (err) {
        setStatusMessage('No se pudo acceder a la cámara. Por favor, verifica los permisos.');
        console.error('Error al acceder a la cámara:', err);
      }
    };

    iniciarCamara();

    // Limpieza al desmontar el componente (apagar la cámara)
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleCapturar = () => {
    // Lógica para capturar la foto y enviarla al backend
    alert('Rostro capturado con éxito');
  };

  return (
    <main className="facial-container">
      <header className="facial-header">
        <h2>Verificación Facial</h2>
        <p>Alinea tu rostro en el centro del círculo para completar el acceso</p>
      </header>

      {/* Contenedor del Visor / Cámara */}
      <div className="camera-wrapper">
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          muted 
          className="webcam-video"
        />
        {/* Guía circular sobrepuesta */}
        <div className="facial-guide-circle">
          <div className="scan-line"></div>
        </div>
      </div>

      {/* Indicador de estado */}
      <p className="status-text">{statusMessage}</p>

      {/* Acciones */}
      <div className="facial-actions">
        <button onClick={handleCapturar} className="btn btn-success">
          Capturar Rostro
        </button>
      </div>
    </main>
  );
}