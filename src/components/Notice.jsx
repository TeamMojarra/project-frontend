export default function Notice({ notice, loading }) {
  return (
    <>
      {notice && <div className={`notice ${notice.type}`}>{notice.text}</div>}
      {loading && <div className="loading-bar" />}
    </>
  );
}
