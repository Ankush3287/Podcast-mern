import Button from "../../components/shared/Button/Button";
import Card from "../../components/shared/Card/Card";
import styles from "./Home.module.css";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();
  function startRegister() {
    navigate("/authenticate");
  }

  return (
    <div className={styles.cardWrapper}>
      <Card title="Welcome to Podcast!" icon="logo">
        <p className={styles.text}>
          We’re working hard to get Podcast ready for everyone! While we wrap up
          the finishing touches, we’re adding people gradually to make sure
          nothing breaks
        </p>
        <div>
          <Button onClick={startRegister} text="Let's Go"></Button>
        </div>
        <div className={styles.loginWrapper}>
          <span className={styles.invite}>Have an invite text?</span>
        </div>
      </Card>
    </div>
  );
};

export default Home;
