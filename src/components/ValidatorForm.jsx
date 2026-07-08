import { useState } from "react";
import jsQR from "jsqr";

import Input from "./Input";
import { formatDate } from "../utils/formatters";

export default function ValidatorForm({ result, ticketCode, onScan, onTicketCode, onSubmit }) {
  const [scanMessage, setScanMessage] = useState("");
  const ticket = result?.ticket;

  async function handleQrUpload(event) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setScanMessage("Leyendo imagen...");
    const code = await readQrFromImage(file).catch(() => null);
    event.target.value = "";

    if (!code) {
      setScanMessage("No se detectó un QR válido en la imagen.");
      return;
    }

    setScanMessage(`QR detectado: ${code}`);
    onTicketCode(code);
    await onScan(code);
  }

  return (
    <form className="panel form-card view-panel validator-panel" onSubmit={onSubmit}>
      <p className="eyebrow">Control de acceso</p>
      <h2>Validar ticket</h2>
      <p className="view-copy">Ingresa el código único o sube una imagen del QR para marcar el ticket como utilizado si pertenece a uno de tus eventos.</p>
      <Input helper="Ejemplo: RSV-ABC123DEFG" label="Código" value={ticketCode} onChange={onTicketCode} placeholder="RSV-ABC123" />
      <label className="qr-upload-box">
        <span>Subir imagen del QR</span>
        <input accept="image/*" onChange={handleQrUpload} type="file" />
        <small>{scanMessage || "Puedes subir una captura o foto del QR del ticket."}</small>
      </label>
      <button className="primary" type="submit">Validar acceso</button>
      {result && (
        <div className={`validation-result ${result.valid ? "success" : "error"}`}>
          <span>{result.status === "already_used" ? "Ticket ya usado" : result.valid ? "Acceso aprobado" : "Acceso rechazado"}</span>
          <strong>{result.message}</strong>
          {ticket && (
            <dl>
              <div>
                <dt>Evento</dt>
                <dd>{ticket.event?.name || "Evento"}</dd>
              </div>
              <div>
                <dt>Asistente</dt>
                <dd>{ticket.user?.name || `Usuario #${ticket.user_id}`}</dd>
              </div>
              <div>
                <dt>Email</dt>
                <dd>{ticket.user?.email || "No disponible"}</dd>
              </div>
              <div>
                <dt>Código</dt>
                <dd>{ticket.ticket_code}</dd>
              </div>
              <div>
                <dt>Estado</dt>
                <dd>{ticket.status}</dd>
              </div>
              {ticket.used_at && (
                <div>
                  <dt>Usado</dt>
                  <dd>{formatDate(ticket.used_at)}</dd>
                </div>
              )}
            </dl>
          )}
        </div>
      )}
    </form>
  );
}

function readQrFromImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const image = new Image();
      image.onerror = reject;
      image.onload = () => {
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d", { willReadFrequently: true });
        if (!context) {
          resolve(null);
          return;
        }

        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;
        context.drawImage(image, 0, 0);
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const qr = jsQR(imageData.data, imageData.width, imageData.height);
        resolve(qr?.data || null);
      };
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}
