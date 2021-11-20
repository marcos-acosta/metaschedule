import "./Header.css";

export default function Header() {
  return (
    <div className="header">
      <div className="headerTitle">
        metaschedule
      </div>
      <div className="headerButton1">
        <button className="headerButton metaButton gitHubButton">
          GitHub
        </button>
      </div>
      <div className="headerButton2">
        <button className="headerButton metaButton refreshButton">
          Refresh
        </button>
      </div>
    </div>
  )
}