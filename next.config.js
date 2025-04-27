/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    esmExternals: false, // Tắt esmExternals để tránh xung đột
  },
  transpilePackages: [
    "antd",
    "@ant-design/icons",
    "@ant-design/icons-svg",
    "@rc-component/util", // Thêm thư viện gây lỗi
    "@rc-component/color-picker",
    "@rc-component/mutate-observer",
    "@rc-component/portal",
    "@rc-component/qrcode",
    "@rc-component/tour",
    "@rc-component/trigger",
    "rc-util",
    "rc-input",
    "rc-pagination",
    "rc-field-form",
    "rc-select",
    "rc-table",
    "rc-tree",
    "rc-menu",
    "rc-tabs",
    "rc-dropdown",
    "rc-picker",
    "rc-notification",
    "rc-tooltip",
    "rc-tree-select",
    "rc-cascader",
    "rc-collapse",
    "rc-dialog",
    "rc-drawer",
    "rc-image",
    "rc-input-number",
    "rc-mentions",
    "rc-motion",
    "rc-overflow",
    "rc-progress",
    "rc-rate",
    "rc-resize-observer",
    "rc-segmented",
    "rc-slider",
    "rc-steps",
    "rc-switch",
    "rc-upload",
  ], // Biên dịch tất cả thư viện liên quan đến antd và rc-component
};

module.exports = nextConfig;