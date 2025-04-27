import { Layout } from "antd";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import ConnectionTable from "../../components/ConnectionTable";
import styles from "../../styles/Dashboard.module.css";

const { Sider, Content } = Layout;

export default function Connections() {
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider width={250} className={styles.sider}>
        <Sidebar />
      </Sider>
      <Layout>
        <Header />
        <Content className={styles.content}>
          <h2>Quản lý kết nối thiết bị</h2>
          <ConnectionTable />
        </Content>
      </Layout>
    </Layout>
  );
}
