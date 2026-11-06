import { getDailyTip } from "@/lib/tips";

export default function DailyTip() {
  const { tip, category } = getDailyTip();
  const today = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="daily-tip card">
      <div className="daily-tip-head">
        <span className="daily-tip-leaf" aria-hidden="true">🌱</span>
        <div>
          <p className="daily-tip-kicker">Tip of the day · {category}</p>
          <p className="daily-tip-date">{today}</p>
        </div>
      </div>
      <p className="daily-tip-body">{tip}</p>
    </div>
  );
}
