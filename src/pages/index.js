import { useState } from "react";
import { useRouter } from "next/router";
import { Form, Input, Button, Card, Typography, message } from "antd";
import Link from "next/link";
import { login } from "../lib/api";
import styles from "../styles/Login.module.css";

const { Title } = Typography;

export default function Login() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await login({
        username: values.username,
        password: values.password,
      });

      message.success("Đăng nhập thành công!");
      router.push("/dashboards/devices");
    } catch (error) {
      message.error(error.message || "Đăng nhập thất bại");
    }
    setLoading(false);
  };

  return (
    <div className={styles.container}>
      <Card className={styles.loginCard}>
        <Title level={2} style={{ textAlign: "center" }}>
          Đăng nhập
        </Title>
        <Form name="login" onFinish={onFinish} layout="vertical">
          <Form.Item
            label="Tên đăng nhập"
            name="username"
            rules={[
              { required: true, message: "Vui lòng nhập tên đăng nhập!" },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Mật khẩu"
            name="password"
            rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              Đăng nhập
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
