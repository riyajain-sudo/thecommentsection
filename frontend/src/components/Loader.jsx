export default function Loader({ label = "Loading..." }) {
  return (
    <div className="state-block">
      <div className="loader" />
      <p>{label}</p>
    </div>
  );
}
