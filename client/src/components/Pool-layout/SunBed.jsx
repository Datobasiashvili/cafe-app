import "../../styles/sunBed.css";

export default function SunBed({ bed, onToggle, orientation = "horizontal" }) {
  const status = bed.status || (bed.taken ? "occupied" : "available");
  const stateClass = `sunbed--${status}`;
  const orientClass = `sunbed--${orientation}`;
  const label = status === "occupied" ? "დაკავებული" : status === "reserved" ? "დაჯავშნილი" : "თავისუფალი";

  return (
    <button
      className={`sunbed ${stateClass} ${orientClass}`}
      onClick={() => onToggle(bed.id)}
      title={`შეზლონგი ${bed.id} - ${label}`}
      aria-label={`შეზლონგი ${bed.id}, ${label}. სტატუსის ასარჩევად დააჭირეთ.`}
    >
      <div className="sunbed-pillow" />
      <div className="sunbed-body">
        <span className="sunbed-number">{bed.id}</span>
      </div>
    </button>
  );
}
