import { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Select,
  Input,
  Switch,
  message,
} from "antd";
import { EyeOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import {
  getConnections,
  deleteConnection,
  createConnection,
  updateConnection,
  getConnectionById,
} from "../lib/api";
import { getDevices } from "../lib/api";
import styles from "../styles/Dashboard.module.css";
import moment from "moment";

const ConnectionTable = () => {
  const [connections, setConnections] = useState([]);
  const [filteredConnections, setFilteredConnections] = useState([]);
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [currentConnection, setCurrentConnection] = useState(null);
  const [form] = Form.useForm();

  // Fetch connections and devices on component mount
  useEffect(() => {
    fetchConnections();
    fetchDevices();
  }, []);

  const fetchConnections = async () => {
    setLoading(true);
    try {
      const data = await getConnections(); // Assumes getConnections fetches /connected-devices
      const mappedConnections = data.map((connection) => ({
        key: connection.ConnectedDeviceID,
        deviceId: connection.device_id,
        connectionTime: moment(connection.ConnectedTimeAt).format(
          "YYYY-MM-DD HH:mm"
        ),
        isConnected: connection.isConnected,
        sourceDevice: connection.devices?.[0]?.Name || "Không xác định",
        deviceID: connection.devices?.[0]?.DeviceID || null,
      }));
      setConnections(mappedConnections);
      setFilteredConnections(mappedConnections);
    } catch (error) {
      message.error(error.message || "Lỗi khi tải danh sách kết nối");
    } finally {
      setLoading(false);
    }
  };

  const fetchDevices = async () => {
    try {
      const data = await getDevices();
      setDevices(
        data.map((device) => ({ value: device.DeviceID, label: device.Name }))
      );
    } catch (error) {
      message.error(error.message || "Lỗi khi tải danh sách thiết bị");
    }
  };

  // Handle search
  const handleSearch = (value) => {
    if (!value) {
      setFilteredConnections(connections);
      return;
    }
    const filtered = connections.filter(
      (connection) =>
        connection.deviceId.toLowerCase().includes(value.toLowerCase()) ||
        connection.sourceDevice.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredConnections(filtered);
  };

  // Handle create or update connection
  const handleSaveConnection = async (values) => {
    try {
      const connectionData = {
        device_id: values.device_id,
        ConnectedTimeAt: values.ConnectedTimeAt
          ? moment(values.ConnectedTimeAt).toISOString()
          : moment().toISOString(),
        isConnected: values.isConnected || false,
        deviceID: values.deviceID || null,
      };
      if (currentConnection) {
        // Update connection
        await updateConnection(currentConnection.key, connectionData);
        message.success("Cập nhật kết nối thành công");
      } else {
        // Create new connection
        await createConnection(connectionData);
        message.success("Tạo kết nối thành công");
      }
      fetchConnections();
      setIsModalVisible(false);
      form.resetFields();
      setCurrentConnection(null);
    } catch (error) {
      message.error(error.message || "Lỗi khi lưu kết nối");
    }
  };

  // Handle delete connection
  const handleDelete = async (connectionId) => {
    Modal.confirm({
      title: "Xác nhận xóa",
      content: "Bạn có chắc chắn muốn xóa kết nối này?",
      onOk: async () => {
        try {
          await deleteConnection(connectionId);
          message.success("Xóa kết nối thành công");
          fetchConnections();
        } catch (error) {
          message.error(error.message || "Lỗi khi xóa kết nối");
        }
      },
    });
  };

  // Handle view connection details
  const handleView = async (connectionId) => {
    try {
      const connection = await getConnectionById(connectionId);
      setCurrentConnection({
        key: connection.ConnectedDeviceID,
        deviceId: connection.device_id,
        connectionTime: moment(connection.ConnectedTimeAt).format(
          "YYYY-MM-DD HH:mm"
        ),
        isConnected: connection.isConnected,
        sourceDevice: connection.devices?.[0]?.Name || "Không xác định",
        deviceID: connection.devices?.[0]?.DeviceID || null,
      });
      setIsViewModalVisible(true);
    } catch (error) {
      message.error(error.message || "Lỗi khi xem chi tiết kết nối");
    }
  };

  // Handle open edit modal
  const handleEdit = (connection) => {
    setCurrentConnection(connection);
    form.setFieldsValue({
      device_id: connection.deviceId,
      deviceID: connection.deviceID,
      ConnectedTimeAt: moment(connection.connectionTime, "YYYY-MM-DD HH:mm"),
      isConnected: connection.isConnected,
    });
    setIsModalVisible(true);
  };

  // Table columns
  const columns = [
    {
      title: "ID thiết bị kết nối",
      dataIndex: "deviceId",
      key: "deviceId",
    },
    {
      title: "Thiết bị liên kết",
      dataIndex: "sourceDevice",
      key: "sourceDevice",
    },
    {
      title: "Thời gian kết nối",
      dataIndex: "connectionTime",
      key: "connectionTime",
    },
    {
      title: "Trạng thái",
      dataIndex: "isConnected",
      key: "isConnected",
      render: (isConnected) => (isConnected ? "Đang kết nối" : "Ngắt kết nối"),
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <span>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleView(record.key)}
            className={styles.actionView}
          >
            Xem
          </Button>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            className={styles.actionEdit}
          >
            Sửa
          </Button>
          <Button
            type="link"
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.key)}
            className={styles.actionDelete}
          >
            Xóa
          </Button>
        </span>
      ),
    },
  ];

  return (
    <div>
      <Input.Search
        placeholder="Tìm kiếm theo ID thiết bị hoặc thiết bị liên kết"
        onSearch={handleSearch}
        style={{ marginBottom: 16 }}
      />
      <Button
        type="primary"
        onClick={() => {
          setCurrentConnection(null);
          form.resetFields();
          setIsModalVisible(true);
        }}
        style={{ marginBottom: 16 }}
      >
        Thêm kết nối
      </Button>
      <Table
        dataSource={filteredConnections}
        columns={columns}
        pagination={{ pageSize: 5 }}
        loading={loading}
        className={styles.table}
      />

      {/* Modal for create/edit connection */}
      <Modal
        title={currentConnection ? "Chỉnh sửa kết nối" : "Tạo kết nối mới"}
        visible={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
          setCurrentConnection(null);
        }}
        onOk={() => form.submit()}
      >
        <Form form={form} onFinish={handleSaveConnection} layout="vertical">
          <Form.Item
            name="device_id"
            label="ID thiết bị kết nối"
            rules={[
              { required: true, message: "Vui lòng nhập ID thiết bị kết nối" },
            ]}
          >
            <Input placeholder="Nhập ID thiết bị (e.g., phone_001)" />
          </Form.Item>
          <Form.Item
            name="deviceID"
            label="Thiết bị liên kết"
            rules={[
              { required: false, message: "Vui lòng chọn thiết bị liên kết" },
            ]}
          >
            <Select options={devices} placeholder="Chọn thiết bị" allowClear />
          </Form.Item>
          <Form.Item
            name="ConnectedTimeAt"
            label="Thời gian kết nối"
            rules={[
              { required: true, message: "Vui lòng nhập thời gian kết nối" },
            ]}
          >
            <Input type="datetime-local" />
          </Form.Item>
          <Form.Item
            name="isConnected"
            label="Trạng thái kết nối"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal for viewing connection details */}
      <Modal
        title="Chi tiết kết nối"
        visible={isViewModalVisible}
        onCancel={() => setIsViewModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsViewModalVisible(false)}>
            Đóng
          </Button>,
        ]}
      >
        {currentConnection && (
          <div>
            <p>
              <strong>ID thiết bị kết nối:</strong> {currentConnection.deviceId}
            </p>
            <p>
              <strong>Thiết bị liên kết:</strong>{" "}
              {currentConnection.sourceDevice}
            </p>
            <p>
              <strong>Thời gian kết nối:</strong>{" "}
              {currentConnection.connectionTime}
            </p>
            <p>
              <strong>Trạng thái:</strong>{" "}
              {currentConnection.isConnected ? "Đang kết nối" : "Ngắt kết nối"}
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ConnectionTable;
