import { Breadcrumb, Dropdown, Menu } from "antd";
import { useRouter } from "next/router";
import styles from "../styles/Dashboard.module.css";

export default function Header() {
  const router = useRouter();

  let pageTitle = "Trang quản lý thiết bị";
  if (router.pathname === "/dashboards/rooms") {
    pageTitle = "Trang quản lý phòng";
  } else if (router.pathname === "/dashboards/connections") {
    pageTitle = "Trang quản lý kết nối";
  }

  const handleLogout = () => {
    // Xóa thông tin đăng nhập (nếu có, ví dụ: xóa token trong localStorage)
    sessionStorage.removeItem("token"); // Giả sử bạn lưu token
    // Chuyển hướng về trang đăng nhập
    router.push("/");
  };

  const dropdownMenu = (
    <Menu className={styles.dropdownMenu}>
      <Menu.Item
        key="logout"
        className={styles.dropdownItem}
        onClick={handleLogout}
      >
        Đăng xuất
      </Menu.Item>
    </Menu>
  );

  return (
    <div className={styles.header}>
      <div className={styles.headerContent}>
        <h1>{pageTitle}</h1>
        <Breadcrumb className={styles.breadcrumb}>
          <Breadcrumb.Item>Trang chủ</Breadcrumb.Item>
          <Breadcrumb.Item>{pageTitle.replace("Trang ", "")}</Breadcrumb.Item>
        </Breadcrumb>
      </div>
      <Dropdown overlay={dropdownMenu} trigger={["click"]}>
        <div className={styles.userIcon}>👤</div>
      </Dropdown>
    </div>
  );
}
