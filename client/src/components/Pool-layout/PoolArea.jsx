import SunBed from "./SunBed";
import "../../styles/PoolArea.css";

export default function PoolArea({ layout, onToggle }) {
  const { grass, top, left, right, bottom, extra } = layout;

  return (
    <div className="pool-area">

      <div className="grass-area">
        <span className="grass-label">🌿 ბალახი</span>
        <div className="bed-row">
          {grass.map((bed) => (
            <SunBed key={bed.id} bed={bed} onToggle={onToggle} orientation="horizontal" />
          ))}
        </div>
      </div>

      <div className="bed-row bed-row--top">
        {top.map((bed) => (
          <SunBed key={bed.id} bed={bed} onToggle={onToggle} orientation="horizontal" />
        ))}
      </div>

      <div className="pool-middle">

        <div className="side-col side-col--left">
          {left.map((bed) => (
            <SunBed key={bed.id} bed={bed} onToggle={onToggle} orientation="vertical" />
          ))}
        </div>

        <div className="pool-water">
          <span className="pool-label">აუზი</span>
        </div>

        <div className="side-col side-col--right">
          {right.map((bed) => (
            <SunBed key={bed.id} bed={bed} onToggle={onToggle} orientation="vertical" />
          ))}
        </div>

      </div>

      <div className="bed-row bed-row--bottom">
        {bottom.map((bed) => (
          <SunBed key={bed.id} bed={bed} onToggle={onToggle} orientation="horizontal" />
        ))}
      </div>

      <div className="pool-divider" />

      <div className="extra-area">
        <span className="extra-label">➕ დამატებითი შეზლონგები</span>
        <div className="bed-row">
          {extra.map((bed) => (
            <SunBed key={bed.id} bed={bed} onToggle={onToggle} orientation="horizontal" />
          ))}
        </div>
      </div>

    </div>
  );
}