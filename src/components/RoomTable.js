import { useState, useEffect } from "react";
import { Table, Button, Modal, Form, Input, message, Switch } from "antd";
import { EyeOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import {
  getRooms,
  deleteRoom,
  createRoom,
  updateRoom,
  getRoomById,
  updateConnection,
} from "../lib/api";
import SearchBar from "../components/SearchBar";
import styles from "../styles/Dashboard.module.css";

const RoomTable = () => {
  const [rooms, setRooms] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const data = await getRooms();
      const mappedRooms = data.map((room) => ({
        key: room.RoomID,
        roomName: room.RoomName,
        devices:
          room.devices?.map((device) => ({
            DeviceID: device.DeviceID,
            Name: device.Name,
            connectedDevices:
              device.connectedDevices?.map((cd) => ({
                ConnectedDeviceID: cd.ConnectedDeviceID,
                isConnected: cd.isConnected,
                device_id: cd.device_id,
                ConnectedTimeAt: cd.ConnectedTimeAt,
              })) || [],
          })) || [],
      }));
      setRooms(mappedRooms);
      setFilteredRooms(mappedRooms);
    } catch (error) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value) => {
    if (!value) {
      setFilteredRooms(rooms);
      return;
    }
    const filtered = rooms.filter((room) =>
      room.roomName.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredRooms(filtered);
  };

  const handleSaveRoom = async (values) => {
    try {
      if (currentRoom) {
        await updateRoom(currentRoom.key, values);
        message.success("Cập nhật phòng thành công");
      } else {
        await createRoom(values);
        message.success("Tạo phòng thành công");
      }
      fetchRooms();
      setIsModalVisible(false);
      form.resetFields();
      setCurrentRoom(null);
    } catch (error) {
      message.error(error.message);
    }
  };

  const handleDelete = async (roomId) => {
    try {
      await deleteRoom(roomId);
      message.success("Xóa phòng thành công");
      fetchRooms();
    } catch (error) {
      message.error(error.message);
    }
  };

  const handleView = async (roomId) => {
    try {
      const room = await getRoomById(roomId);
      setCurrentRoom({
        RoomID: room.RoomID,
        RoomName: room.RoomName,
        devices:
          room.devices?.map((device) => ({
            DeviceID: device.DeviceID,
            Name: device.Name,
            connectedDevices:
              device.connectedDevices?.map((cd) => ({
                ConnectedDeviceID: cd.ConnectedDeviceID,
                isConnected: cd.isConnected,
                device_id: cd.device_id,
                ConnectedTimeAt: cd.ConnectedTimeAt,
              })) || [],
          })) || [],
      });
      setIsViewModalVisible(true);
      fetchRooms();
    } catch (error) {
      message.error(error.message);
    }
  };

  const handleToggleConnection = async (connectedDeviceId, currentStatus) => {
    if (!connectedDeviceId) {
      message.error("Không tìm thấy ID kết nối");
      return;
    }
    try {
      const newStatus = !currentStatus;
      await updateConnection(connectedDeviceId, { isConnected: newStatus });
      message.success(`Đã ${newStatus ? "bật" : "tắt"} kết nối`);
      fetchRooms();
    } catch (error) {
      message.error(error.message);
    }
  };

  const handleToggleAllConnections = async (room, checked) => {
    try {
      const connectionPromises = room.devices
        .flatMap((device) => device.connectedDevices)
        .map((cd) =>
          updateConnection(cd.ConnectedDeviceID, { isConnected: checked })
        );
      await Promise.all(connectionPromises);
      message.success(`Đã ${checked ? "bật" : "tắt"} tất cả kết nối`);
      fetchRooms();
    } catch (error) {
      message.error(error.message);
    }
  };

  const handleEdit = (room) => {
    setCurrentRoom(room);
    form.setFieldsValue({ RoomName: room.roomName });
    setIsModalVisible(true);
  };

  const columns = [
    {
      title: "Tên phòng",
      dataIndex: "roomName",
      key: "roomName",
    },
    {
      title: "Trạng thái kết nối",
      key: "connectionStatus",
      render: (_, record) => {
        const isConnected = record.devices?.some((device) =>
          device.connectedDevices?.some((cd) => cd.isConnected)
        );
        return (
          <span style={{ color: isConnected ? "green" : "red" }}>
            {isConnected ? "Đã kết nối" : "Chưa kết nối"}
          </span>
        );
      },
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => {
        const allConnected = record.devices?.every((device) =>
          device.connectedDevices?.every((cd) => cd.isConnected)
        );
        const hasConnections = record.devices?.some(
          (device) => device.connectedDevices?.length > 0
        );
        return (
          <div>
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
            {hasConnections && (
              <Switch
                checked={allConnected}
                onChange={(checked) =>
                  handleToggleAllConnections(record, checked)
                }
                checkedChildren="Bật"
                unCheckedChildren="Tắt"
              />
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div>
      <SearchBar onSearch={handleSearch} />
      <Button
        type="primary"
        onClick={() => {
          setCurrentRoom(null);
          form.resetFields();
          setIsModalVisible(true);
        }}
        style={{ marginBottom: 16 }}
      >
        Thêm phòng
      </Button>
      <Table
        dataSource={filteredRooms}
        columns={columns}
        pagination={{ pageSize: 5 }}
        loading={loading}
        className={styles.table}
      />
      <Modal
        title={currentRoom ? "Chỉnh sửa phòng" : "Tạo phòng mới"}
        visible={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
          setCurrentRoom(null);
        }}
        onOk={() => form.submit()}
      >
        <Form form={form} onFinish={handleSaveRoom} layout="vertical">
          <Form.Item
            name="RoomName"
            label="Tên phòng"
            rules={[{ required: true, message: "Vui lòng nhập tên phòng" }]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title="Chi tiết phòng"
        visible={isViewModalVisible}
        onCancel={() => setIsViewModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsViewModalVisible(false)}>
            Đóng
          </Button>,
        ]}
      >
        {currentRoom && (
          <div>
            <p>
              <strong>Tên phòng:</strong> {currentRoom.RoomName}
            </p>
            <p>
              <strong>Số thiết bị:</strong> {currentRoom.devices?.length || 0}
            </p>
            <p>
              <strong>Trạng thái kết nối:</strong>{" "}
              {currentRoom.devices?.some((device) =>
                device.connectedDevices?.some((cd) => cd.isConnected)
              )
                ? "Đã kết nối"
                : "Chưa kết nối"}
            </p>
            {currentRoom.devices?.length > 0 && (
              <div>
                <strong>Thiết bị:</strong>
                <ul>
                  {currentRoom.devices.map((device) => (
                    <li key={device.DeviceID}>
                      {device.Name} -{" "}
                      {device.connectedDevices?.length > 0 ? (
                        device.connectedDevices.map((cd) =>
                          cd && cd.ConnectedDeviceID ? (
                            <div
                              key={cd.ConnectedDeviceID}
                              style={{ marginBottom: 8 }}
                            >
                              <span style={{ marginRight: 8 }}>
                                {cd.isConnected ? "Đã kết nối" : "Chưa kết nối"}
                              </span>
                              <Switch
                                checked={cd.isConnected}
                                onChange={() =>
                                  handleToggleConnection(
                                    cd.ConnectedDeviceID,
                                    cd.isConnected
                                  )
                                }
                                checkedChildren="Bật"
                                unCheckedChildren="Tắt"
                              />
                            </div>
                          ) : (
                            <span key={device.DeviceID}>
                              Kết nối không hợp lệ
                            </span>
                          )
                        )
                      ) : (
                        <span>Không có kết nối</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default RoomTable;
