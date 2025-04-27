import { Layout } from "antd";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import SearchBar from "../../components/SearchBar"; // Import SearchBar
import RoomTable from "../../components/RoomTable";
import styles from "../../styles/Dashboard.module.css";

const { Sider, Content } = Layout;

export default function Rooms() {
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider width={250} className={styles.sider}>
        <Sidebar />
      </Sider>
      <Layout>
        <Header />
        <Content className={styles.content}>
          <h2>Quản lý phòng</h2>
          <RoomTable />
        </Content>
      </Layout>
    </Layout>
  );
}
