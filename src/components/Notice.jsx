export default function Notice({ notice, loading }) {
  return (
    <>
      {notice && (
        <div className={`notice ${notice.type}`} role="alert">
          {notice.text}
        </div>
      )}
      {loading && (
        <div aria-live="polite" role="status">
          <span className="sr-only">Cargando información de Reservent</span>
          <div className="loading-bar" />
        </div>
      )}
    </>
  );
}
