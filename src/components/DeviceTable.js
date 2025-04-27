import { useState, useEffect } from "react";
import { Table, Button, Modal, Form, Input, Select, message } from "antd";
import { EyeOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import {
  getDevices,
  deleteDevice,
  createDevice,
  updateDevice,
  getDeviceById,
} from "../lib/api";
import { getRooms } from "../lib/api";
import SearchBar from "../components/SearchBar"; // Import SearchBar
import styles from "../styles/Dashboard.module.css";

const DeviceTable = () => {
  const [devices, setDevices] = useState([]);
  const [filteredDevices, setFilteredDevices] = useState([]); // Thêm state cho danh sách đã lọc
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [currentDevice, setCurrentDevice] = useState(null);
  const [form] = Form.useForm();

  // Lấy danh sách thiết bị và phòng khi component được mount
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
        mac: device.MAC,
        ip: device.ip,
        description: device.Description,
        deviceCode: device.device_code,
        roomId: device.RoomID,
      }));
      setDevices(mappedDevices);
      setFilteredDevices(mappedDevices); // Khởi tạo danh sách đã lọc
    } catch (error) {
      message.error(error.message);
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
      message.error(error.message);
    }
  };

  // Xử lý tìm kiếm
  const handleSearch = (value) => {
    if (!value) {
      setFilteredDevices(devices); // Nếu không có giá trị tìm kiếm, hiển thị toàn bộ danh sách
      return;
    }
    const filtered = devices.filter(
      (device) =>
        device.deviceName.toLowerCase().includes(value.toLowerCase()) ||
        device.room.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredDevices(filtered);
  };

  // Xử lý tạo hoặc cập nhật thiết bị
  const handleSaveDevice = async (values) => {
    try {
      if (currentDevice) {
        await updateDevice(currentDevice.key, values);
        message.success("Cập nhật thiết bị thành công");
      } else {
        await createDevice(values);
        message.success("Tạo thiết bị thành công");
      }
      fetchDevices();
      setIsModalVisible(false);
      form.resetFields();
      setCurrentDevice(null);
    } catch (error) {
      message.error(error.message);
    }
  };

  // Xử lý xóa thiết bị
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
          message.error(error.message);
        }
      },
    });
  };

  // Xử lý xem chi tiết thiết bị
  const handleView = async (deviceId) => {
    try {
      const device = await getDeviceById(deviceId);
      setCurrentDevice({
        ...device,
        room: device.room?.RoomName || "Chưa gán phòng",
      });
      setIsViewModalVisible(true);
    } catch (error) {
      message.error(error.message);
    }
  };

  // Xử lý mở modal chỉnh sửa
  const handleEdit = (device) => {
    setCurrentDevice(device);
    form.setFieldsValue({
      Name: device.deviceName,
      DeviceType: device.deviceType,
      Description: device.description,
      MAC: device.mac,
      RoomID: device.roomId,
      ip: device.ip,
    });
    setIsModalVisible(true);
  };

  // Cột của bảng
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
        </span>
      ),
    },
  ];

  return (
    <div>
      <SearchBar onSearch={handleSearch} /> {/* Thêm SearchBar */}
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
        dataSource={filteredDevices} // Sử dụng filteredDevices thay vì devices
        columns={columns}
        pagination={{ pageSize: 5 }}
        loading={loading}
        className={styles.table}
      />
      {/* Modal tạo/chỉnh sửa thiết bị */}
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
            rules={[{ required: true, message: "Vui lòng nhập địa chỉ MAC" }]}
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
        </Form>
      </Modal>
      {/* Modal xem chi tiết thiết bị */}
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
              <strong>Mô tả:</strong> {currentDevice.Description || "Không có"}
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DeviceTable;
