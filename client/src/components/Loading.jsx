import "../styles/loading.css";

export default function Loading({
  variant = 'inline',
  size = 'md',
  label = 'Loading',
  sublabel,
  indicator = 'dots',
}) {
  const isOverlay = variant === 'overlay';

  const wrapperClass = isOverlay
    ? 'loading-overlay'
    : ['loading-inline', size !== 'md' && `loading-inline--${size}`]
        .filter(Boolean)
        .join(' ');

  return (
    <div className={wrapperClass} role="status" aria-live="polite" aria-label={label}>

      <div className="loader-spinner">
        <div className="loader-core" />
      </div>

      <div className="loader-text-block">
        <span className="loader-label">{label}</span>
        {sublabel && (
          <span className="loader-sublabel">{sublabel}</span>
        )}
      </div>

      {indicator === 'dots' && (
        <div className="loader-dots" aria-hidden="true">
          <div className="loader-dot" />
          <div className="loader-dot" />
          <div className="loader-dot" />
        </div>
      )}

      {indicator === 'bar' && (
        <div className="loader-bar-track" aria-hidden="true">
          <div className="loader-bar-fill" />
        </div>
      )}

    </div>
  );
}