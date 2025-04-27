import { Menu } from "antd";
import { DesktopOutlined, HomeOutlined, LinkOutlined } from "@ant-design/icons";
import { useRouter } from "next/router";
import styles from "../styles/Dashboard.module.css";

export default function Sidebar() {
  const router = useRouter();

  const handleMenuClick = (route) => {
    router.push(route);
  };

  return (
    <div className={styles.siderWrapper}>
      <div className={styles.siderHeader}>
        <h2>Quản lý hệ thống</h2>
      </div>
      <Menu
        mode="inline"
        selectedKeys={[router.pathname]}
        className={styles.menu}
        onClick={({ key }) => handleMenuClick(key)}
        items={[
          {
            key: "/dashboards/rooms",
            icon: <HomeOutlined />,
            label: "Quản lý phòng",
          },
          {
            key: "/dashboards/devices",
            icon: <DesktopOutlined />,
            label: "Quản lý thiết bị",
          },  
          {
            key: "/dashboards/connections",
            icon: <LinkOutlined />,
            label: "Quản lý kết nối",
          },
        ]}
      />
    </div>
  );
}
