import "./Header.css";
import logo_white from "./../../images/logo_white.png"

export default function Header(props) {
  return (
    <div className="header">
      <div className="logoContainer">
        <img src={logo_white} className="whiteLogo" alt="logo" />
      </div>
      <div className="headerTitle">
        Metaschedule
      </div>
      <div className="headerButton1">
        <button className="headerButton metaButton blueButton" onClick={() => props.refreshCallback()}>
          Refresh
        </button>
      </div>
      <div className="headerButton2">
        <a href="https://github.com/marcos-acosta/metaschedule" target="_blank" rel="noreferrer">
          <button className="headerButton metaButton darkGrayButton">
            GitHub
          </button>
        </a>
      </div>
    </div>
  )
}