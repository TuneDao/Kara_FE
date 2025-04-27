import { Layout } from "antd";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import SearchBar from "../components/SearchBar";
import DeviceTable from "../components/DeviceTable";
import styles from "../styles/Dashboard.module.css";

const { Sider, Content } = Layout;

export default function Dashboard() {
  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* Sidebar */}
      <Sider width={250} className={styles.sider}>
        <Sidebar />
      </Sider>

      <Layout>
        {/* Header */}
        <Header />

        {/* Main Content */}
        <Content className={styles.content}>
          <SearchBar />
          <DeviceTable />
        </Content>
      </Layout>
    </Layout>
  );
}
