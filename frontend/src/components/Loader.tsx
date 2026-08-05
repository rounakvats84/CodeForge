export default function Loader() {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center">
      <div className="uv-loader-wrapper">
        <div className="uv-loader">
          <span className="uv-load"></span>
        </div>
        <span className="uv-loader-text">Connecting to CodeForge...</span>
      </div>
    </div>
  );
}