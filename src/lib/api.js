const API_URL = "https://kara-be.onrender.com/";
// Server : https://kara-be.onrender.com/
export const login = async (credentials) => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Đăng nhập thất bại");
  }

  // Lưu access_token và thông tin user vào sessionStorage
  sessionStorage.setItem("token", data.access_token);
  const payload = JSON.parse(atob(data.access_token.split(".")[1]));
  sessionStorage.setItem("user", JSON.stringify(payload));

  return data;
};

// lib/api.js
export const getProfile = async () => {
  const token = sessionStorage.getItem("token");
  const response = await fetch(`${API_URL}/users/profile`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Lấy thông tin profile thất bại");
  }

  return data;
};

// ROOMS
// Hàm gọi API tạo phòng mới
export const createRoom = async (roomData) => {
  const token = sessionStorage.getItem("token");
  const response = await fetch(`${API_URL}/rooms`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(roomData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Tạo phòng thất bại");
  }

  return data;
};

// Hàm gọi API lấy danh sách phòng
export const getRooms = async () => {
  const token = sessionStorage.getItem("token");
  const response = await fetch(`${API_URL}/rooms`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Lấy danh sách phòng thất bại");
  }

  return data;
};

// Hàm gọi API lấy thông tin phòng theo ID
export const getRoomById = async (roomId) => {
  const token = sessionStorage.getItem("token");
  const response = await fetch(`${API_URL}/rooms/${roomId}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Lấy thông tin phòng thất bại");
  }

  return data;
};

// Hàm gọi API cập nhật phòng
export const updateRoom = async (roomId, roomData) => {
  const token = sessionStorage.getItem("token");
  const response = await fetch(`${API_URL}/rooms/${roomId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(roomData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Cập nhật phòng thất bại");
  }

  return data;
};

// Hàm gọi API xóa phòng
export const deleteRoom = async (roomId) => {
  const token = sessionStorage.getItem("token");
  const response = await fetch(`${API_URL}/rooms/${roomId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.message || "Xóa phòng thất bại");
  }
};

// Hàm xử lý phản hồi chung
const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    if (response.status === 401) {
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");
      window.location.href = "/login";
    }
    throw new Error(data.message || "Có lỗi xảy ra");
  }
  return data;
};
// DEVICES
// Hàm gọi API tạo thiết bị mới
export const createDevice = async (deviceData) => {
  const token = sessionStorage.getItem("token");
  const response = await fetch(`${API_URL}/devices`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(deviceData),
  });
  return handleResponse(response);
};

// Hàm gọi API lấy danh sách thiết bị
export const getDevices = async () => {
  const token = sessionStorage.getItem("token");
  const response = await fetch(`${API_URL}/devices`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  return handleResponse(response);
};

// Hàm gọi API lấy thông tin thiết bị theo ID
export const getDeviceById = async (deviceId) => {
  const token = sessionStorage.getItem("token");
  const response = await fetch(`${API_URL}/devices/${deviceId}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  return handleResponse(response);
};

// Hàm gọi API cập nhật thiết bị
export const updateDevice = async (deviceId, deviceData) => {
  const token = sessionStorage.getItem("token");
  const response = await fetch(`${API_URL}/devices/${deviceId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(deviceData),
  });
  return handleResponse(response);
};

// Hàm gọi API xóa thiết bị
export const deleteDevice = async (deviceId) => {
  const token = sessionStorage.getItem("token");
  const response = await fetch(`${API_URL}/devices/${deviceId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return handleResponse(response);
};
// CONNECTIONS
// Hàm gọi API tạo kết nối mới
export const createConnection = async (connectionData) => {
  const token = sessionStorage.getItem("token");
  const response = await fetch(`${API_URL}/connected-devices`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(connectionData),
  });
  return handleResponse(response);
};

// Hàm gọi API lấy danh sách kết nối
export const getConnections = async () => {
  const token = sessionStorage.getItem("token");
  const response = await fetch(`${API_URL}/connected-devices`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  return handleResponse(response);
};

// Hàm gọi API lấy thông tin kết nối theo ID
export const getConnectionById = async (connectionId) => {
  const token = sessionStorage.getItem("token");
  const response = await fetch(`${API_URL}/connected-devices/${connectionId}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  return handleResponse(response);
};

// Hàm gọi API cập nhật kết nối
export const updateConnection = async (connectedDeviceId, connectionData) => {
  const token = sessionStorage.getItem("token");
  const response = await fetch(
    `${API_URL}/connected-devices/${connectedDeviceId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(connectionData),
    }
  );
  return handleResponse(response);
};

// Hàm gọi API xóa kết nối
export const deleteConnection = async (connectionId) => {
  const token = sessionStorage.getItem("token");
  const response = await fetch(`${API_URL}/connected-devices/${connectionId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return handleResponse(response);
};
