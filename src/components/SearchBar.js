import { Input } from "antd";

const SearchBar = ({ onSearch }) => {
  return (
    <Input.Search
      placeholder="Tìm kiếm thiết bị theo tên hoặc phòng"
      onSearch={onSearch}
      style={{ marginBottom: 16 }}
    />
  );
};

export default SearchBar;
