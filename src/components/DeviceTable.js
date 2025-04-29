import { useState, useEffect } from "react";
import { Table, Button, Modal, Form, Input, Select, message } from "antd";
import { EyeOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import {
  getDevices,
  deleteDevice,
  createDevice,
  updateDevice,
  getDeviceById,
  renewDeviceSubscription,
} from "../lib/api";
import { getRooms } from "../lib/api";
import SearchBar from "../components/SearchBar";
import styles from "../styles/Dashboard.module.css";
import moment from "moment";

const DeviceTable = () => {
  const [devices, setDevices] = useState([]);
  const [filteredDevices, setFilteredDevices] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [currentDevice, setCurrentDevice] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchDevices();
    fetchRooms();
  }, []);

  const fetchDevices = async () => {
    setLoading(true);
    try {
      const data = await getDevices();
      const mappedDevices = data.map((device) => ({
        key: device.DeviceID,
        deviceName: device.Name,
        deviceType: device.DeviceType,
        room: device.room?.RoomName || "Chưa gán phòng",
        deviceId: device.device_id,
        ip: device.ip,
        description: device.Description,
        deviceCode: device.device_code || "Hết hạn",
        roomId: device.RoomID,
        subscriptionExpiry: device.subscription_expiry
          ? moment(device.subscription_expiry).format("YYYY-MM-DD HH:mm")
          : "Chưa có",
        plan: device.plan || "Không có",
      }));
      setDevices(mappedDevices);
      setFilteredDevices(mappedDevices);
    } catch (error) {
      message.error(error.message || "Lỗi khi tải danh sách thiết bị");
    } finally {
      setLoading(false);
    }
  };

  const fetchRooms = async () => {
    try {
      const data = await getRooms();
      setRooms(
        data.map((room) => ({ value: room.RoomID, label: room.RoomName }))
      );
    } catch (error) {
      message.error(error.message || "Lỗi khi tải danh sách phòng");
    }
  };

  const handleSearch = (value) => {
    if (!value) {
      setFilteredDevices(devices);
      return;
    }
    const filtered = devices.filter(
      (device) =>
        device.deviceName.toLowerCase().includes(value.toLowerCase()) ||
        device.room.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredDevices(filtered);
  };

  const handleSaveDevice = async (values) => {
    try {
      const deviceData = {
        Name: values.Name,
        DeviceType: values.DeviceType,
        Description: values.Description,
        device_id: values.device_id,
        RoomID: values.RoomID,
        ip: values.ip,
        device_code: values.device_code,
        plan: values.plan,
        subscription_expiry: values.subscription_expiry
          ? moment(values.subscription_expiry).toISOString()
          : undefined,
      };

      if (currentDevice) {
        await updateDevice(currentDevice.key, deviceData);
        message.success("Cập nhật thiết bị thành công");
      } else {
        await createDevice(deviceData);
        message.success("Tạo thiết bị thành công");
      }
      fetchDevices();
      setIsModalVisible(false);
      form.resetFields();
      setCurrentDevice(null);
    } catch (error) {
      message.error(error.message || "Lỗi khi lưu thiết bị");
    }
  };

  const handleDelete = async (deviceId) => {
    Modal.confirm({
      title: "Xác nhận xóa",
      content: "Bạn có chắc chắn muốn xóa thiết bị này?",
      onOk: async () => {
        try {
          await deleteDevice(deviceId);
          message.success("Xóa thiết bị thành công");
          fetchDevices();
        } catch (error) {
          message.error(error.message || "Lỗi khi xóa thiết bị");
        }
      },
    });
  };

  const handleView = async (deviceId) => {
    try {
      const device = await getDeviceById(deviceId);
      setCurrentDevice({
        ...device,
        room: device.room?.RoomName || "Chưa gán phòng",
        subscription_expiry: device.subscription_expiry
          ? moment(device.subscription_expiry).format("YYYY-MM-DD HH:mm")
          : "Chưa có",
        plan: device.plan || "Không có",
        device_code: device.device_code || "Hết hạn",
      });
      setIsViewModalVisible(true);
    } catch (error) {
      message.error(error.message || "Lỗi khi xem chi tiết thiết bị");
    }
  };

  const handleEdit = async (device) => {
    try {
      const updatedDevice = await getDeviceById(device.key);
      const newDevice = {
        key: updatedDevice.DeviceID,
        deviceName: updatedDevice.Name,
        deviceType: updatedDevice.DeviceType,
        room: updatedDevice.room?.RoomName || "Chưa gán phòng",
        deviceId: updatedDevice.device_id,
        ip: updatedDevice.ip,
        description: updatedDevice.Description,
        deviceCode: updatedDevice.device_code || "Hết hạn",
        roomId: updatedDevice.RoomID,
        subscriptionExpiry: updatedDevice.subscription_expiry
          ? moment(updatedDevice.subscription_expiry).format("YYYY-MM-DD HH:mm")
          : "Chưa có",
        plan: updatedDevice.plan || "Không có",
      };

      setCurrentDevice(newDevice);
      form.setFieldsValue({
        Name: newDevice.deviceName,
        DeviceType: newDevice.deviceType,
        Description: newDevice.description,
        device_id: newDevice.deviceId,
        RoomID: newDevice.roomId,
        ip: newDevice.ip,
        device_code:
          newDevice.deviceCode === "Hết hạn" ? undefined : newDevice.deviceCode,
        plan: newDevice.plan === "Không có" ? undefined : newDevice.plan,
        subscription_expiry:
          newDevice.subscriptionExpiry === "Chưa có"
            ? undefined
            : moment(newDevice.subscriptionExpiry, "YYYY-MM-DD HH:mm"),
      });
      setIsModalVisible(true);
    } catch (error) {
      message.error(error.message || "Lỗi khi mở form chỉnh sửa");
    }
  };

  const handleRenew = async (deviceId) => {
    try {
      const device = await getDeviceById(deviceId);
      const baseDate = device.subscription_expiry
        ? moment(device.subscription_expiry).format("YYYY-MM-DD HH:mm")
        : moment().format("YYYY-MM-DD HH:mm");

      Modal.confirm({
        title: "Gia hạn thiết bị",
        content: (
          <div>
            <p>
              <strong>Ngày bắt đầu gia hạn:</strong> {baseDate}
            </p>
            <Form form={form} layout="vertical">
              <Form.Item
                name="plan"
                label="Chọn gói gia hạn"
                rules={[{ required: true, message: "Vui lòng chọn gói" }]}
              >
                <Select placeholder="Chọn gói">
                  <Select.Option value="1month">1 tháng</Select.Option>
                  <Select.Option value="3months">3 tháng</Select.Option>
                  <Select.Option value="6months">6 tháng</Select.Option>
                  <Select.Option value="year">1 năm</Select.Option>
                </Select>
              </Form.Item>
            </Form>
          </div>
        ),
        onOk: async () => {
          try {
            const values = await form.validateFields();
            await renewDeviceSubscription(deviceId, values.plan);
            message.success("Gia hạn thiết bị thành công");
            fetchDevices();
          } catch (error) {
            message.error(error.message || "Lỗi khi gia hạn thiết bị");
          }
        },
      });
    } catch (error) {
      message.error(error.message || "Lỗi khi tải dữ liệu thiết bị");
    }
  };

  const columns = [
    {
      title: "Tên thiết bị",
      dataIndex: "deviceName",
      key: "deviceName",
    },
    {
      title: "Loại thiết bị",
      dataIndex: "deviceType",
      key: "deviceType",
    },
    {
      title: "Phòng",
      dataIndex: "room",
      key: "room",
    },
    {
      title: "Mã thiết bị",
      dataIndex: "deviceCode",
      key: "deviceCode",
    },
    {
      title: "Ngày hết hạn",
      dataIndex: "subscriptionExpiry",
      key: "subscriptionExpiry",
    },
    {
      title: "Action",
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
            Edit
          </Button>
          <Button
            type="link"
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.key)}
            className={styles.actionDelete}
          >
            Xóa
          </Button>
          <Button
            type="link"
            onClick={() => handleRenew(record.key)}
            className={styles.actionRenew}
          >
            Gia hạn
          </Button>
        </span>
      ),
    },
  ];

  return (
    <div>
      <SearchBar onSearch={handleSearch} />
      <Button
        type="primary"
        onClick={() => {
          setCurrentDevice(null);
          form.resetFields();
          setIsModalVisible(true);
        }}
        style={{ marginBottom: 16 }}
      >
        Thêm thiết bị
      </Button>
      <Table
        dataSource={filteredDevices}
        columns={columns}
        pagination={{ pageSize: 5 }}
        loading={loading}
        className={styles.table}
      />
      <Modal
        title={currentDevice ? "Chỉnh sửa thiết bị" : "Tạo thiết bị mới"}
        visible={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
          setCurrentDevice(null);
        }}
        onOk={() => form.submit()}
      >
        <Form form={form} onFinish={handleSaveDevice} layout="vertical">
          <Form.Item
            name="Name"
            label="Tên thiết bị"
            rules={[{ required: true, message: "Vui lòng nhập tên thiết bị" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="DeviceType"
            label="Loại thiết bị"
            rules={[{ required: true, message: "Vui lòng nhập loại thiết bị" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="Description"
            label="Mô tả"
            rules={[{ required: false }]}
          >
            <Input.TextArea />
          </Form.Item>
          <Form.Item
            name="device_id"
            label="ID thiết bị"
            rules={[{ required: true, message: "Vui lòng nhập ID thiết bị" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="RoomID"
            label="Phòng"
            rules={[{ required: true, message: "Vui lòng chọn phòng" }]}
          >
            <Select options={rooms} placeholder="Chọn phòng" />
          </Form.Item>
          <Form.Item
            name="ip"
            label="Địa chỉ IP"
            rules={[{ required: true, message: "Vui lòng nhập địa chỉ IP" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="device_code"
            label="Mã thiết bị"
            rules={[
              {
                pattern: /^\d{6}$/,
                message: "Mã thiết bị phải là số có 6 chữ số",
              },
            ]}
          >
            <Input placeholder="Nhập mã thiết bị (6 chữ số)" />
          </Form.Item>
          <Form.Item
            name="plan"
            label="Gói dịch vụ"
            rules={[{ required: false }]}
          >
            <Select placeholder="Chọn gói" allowClear>
              <Select.Option value="1month">1 tháng</Select.Option>
              <Select.Option value="3months">3 tháng</Select.Option>
              <Select.Option value="6months">6 tháng</Select.Option>
              <Select.Option value="year">1 năm</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="subscription_expiry"
            label="Ngày hết hạn"
            rules={[{ required: false }]}
          >
            <Input type="datetime-local" />
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title="Chi tiết thiết bị"
        visible={isViewModalVisible}
        onCancel={() => setIsViewModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsViewModalVisible(false)}>
            Đóng
          </Button>,
        ]}
      >
        {currentDevice && (
          <div>
            <p>
              <strong>Tên thiết bị:</strong> {currentDevice.Name}
            </p>
            <p>
              <strong>Loại thiết bị:</strong> {currentDevice.DeviceType}
            </p>
            <p>
              <strong>Phòng:</strong> {currentDevice.room}
            </p>
            <p>
              <strong>ID thiết bị:</strong> {currentDevice.device_id}
            </p>
            <p>
              <strong>Địa chỉ IP:</strong> {currentDevice.ip}
            </p>
            <p>
              <strong>Mã thiết bị:</strong> {currentDevice.device_code}
            </p>
            <p>
              <strong>Gói dịch vụ:</strong> {currentDevice.plan}
            </p>
            <p>
              <strong>Ngày hết hạn:</strong> {currentDevice.subscription_expiry}
            </p>
            <p>
              <strong>Mô tả:</strong> {currentDevice.Description || "Không có"}
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DeviceTable;
