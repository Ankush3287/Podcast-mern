import Button from "../../components/shared/Button/Button";
import Card from "../../components/shared/Card/Card";
import styles from "./Home.module.css";
import { Link, useNavigate } from "react-router-dom";

const Home = () => {
  const loginLinkStyle = {
    color: "#0077ff",
    textDecoration: "none",
    fontWeight: "bold",
    marginLeft: "10px",
  };

  const navigate = useNavigate();
  function startRegister() {
    console.log("hello");
    navigate("/register");
  }

  return (
    <div className={styles.cardWrapper}>
      <Card title="Welcome to podcast!" icon="logo">
        <p className={styles.text}>
          We’re working hard to get Codershouse ready for everyone! While we
          wrap up the finishing touches, we’re adding people gradually to make
          sure nothing breaks
        </p>
        <div>
          <Button onClick={startRegister} text="Get your username"></Button>
        </div>
        <div className={styles.loginWrapper}>
          <span className={styles.invite}>Have an invite text?</span>
          <Link style={loginLinkStyle} to="/login">
            Sign in
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default Home;
