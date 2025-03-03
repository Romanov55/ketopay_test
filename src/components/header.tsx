import { useState } from "react";

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header>
      <button onClick={() => setIsMenuOpen(true)} className="burger__button"><img className="burger__image" src="burger.svg" alt="Меню" /></button>
      <h1 className="title">BESIDER</h1>
      <div className={`menu ${isMenuOpen ? "active" : ""}`}>
        <button className="close__menu" onClick={() => setIsMenuOpen(false)}><img className="close__image" src="close.svg" alt="закрыть" /></button>
        <nav className="menu__list">
          <a className="menu__link" href="/">SCIENCE</a>
          <a className="menu__link" href="/">GENERAL</a>
          <a className="menu__link" href="/">ENTERTAINMENT</a>
          <a className="menu__link" href="/">TECHNOLOGY</a>
          <a className="menu__link" href="/">BUSINESS</a>
          <a className="menu__link" href="/">HEALTH</a>
          <a className="menu__link" href="/">SPORTS</a>
        </nav>
      </div>
    </header>
  );
};