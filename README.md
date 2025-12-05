# 🌍 Global Weather - Real-time Weather Globe

เว็บแอปพลิเคชันแสดงสภาพอากาศแบบมืออาชีพ พร้อมลูกโลก 3D แบบ Interactive

## ✨ Features

- 🌐 **ลูกโลก 3D แบบ Interactive** - หมุน ซูม และสำรวจได้อย่างอิสระ
- 🔍 **ระบบค้นหาอัจฉริยะ** - ค้นหาเมืองและประเทศได้ทันที
- 🎯 **Auto Zoom & Pan** - กล้องจะเลื่อนและซูมไปยังตำแหน่งที่เลือกโดยอัตโนมัติ
- 🌡️ **ข้อมูลสภาพอากาศแบบ Real-time** - อุณหภูมิ, ความชื้น, ความเร็วลม, ความกดอากาศ
- 🎨 **Design สวยงาม** - Glassmorphism UI พร้อม Gradient Animation
- 📱 **Responsive Design** - ใช้งานได้ทุกอุปกรณ์

## 🚀 วิธีใช้งาน

1. **ติดตั้ง Dependencies:**
```bash
npm install
```

2. **รันโปรเจค:**
```bash
npm run dev
```

3. **เปิดเบราว์เซอร์:**
ไปที่ `http://localhost:5173`

## 🎮 การใช้งาน

1. **ค้นหาเมือง** - พิมพ์ชื่อเมืองหรือประเทศในช่องค้นหา
2. **เลือกตำแหน่ง** - คลิกที่ผลลัพธ์ที่ต้องการ
3. **ดูสภาพอากาศ** - กล้องจะซูมไปยังตำแหน่งนั้นและแสดงข้อมูลสภาพอากาศ
4. **สำรวจลูกโลก** - ลากเพื่อหมุน, Scroll เพื่อซูม

## 🛠️ เทคโนโลยีที่ใช้

- **React 19** - UI Framework
- **TypeScript** - Type Safety
- **Three.js** - 3D Graphics
- **React Three Fiber** - React Renderer for Three.js
- **React Three Drei** - Useful helpers for R3F
- **Axios** - HTTP Client
- **OpenWeatherMap API** - Weather Data (Free API)
- **Vite** - Build Tool

## 🌐 API

โปรเจคนี้ใช้ **Open-Meteo API** ซึ่งเป็น API ฟรี 100% ไม่ต้องสมัครหรือใช้ API key ใดๆ!

- ✅ ไม่ต้องสมัคร
- ✅ ไม่ต้องใช้ API key
- ✅ ไม่มีข้อจำกัดการใช้งาน
- ✅ ข้อมูลสภาพอากาศแม่นยำจาก NOAA, DWD และอื่นๆ

API Documentation: https://open-meteo.com/

## 📦 Build สำหรับ Production

```bash
npm run build
```

ไฟล์ที่ build เสร็จจะอยู่ในโฟลเดอร์ `dist/`

## 🎨 Customization

- **สี Gradient**: แก้ไขใน `src/App.css` ที่ `.background-gradient`
- **ขนาดลูกโลก**: แก้ไขใน `src/components/Globe.tsx` ที่ `sphereGeometry args`
- **ความเร็วหมุน**: แก้ไขใน `src/components/Globe.tsx` ที่ `rotation.y`

## 📱 Browser Support

- Chrome (แนะนำ)
- Firefox
- Safari
- Edge

## 🙏 Credits

- Earth Textures: [Three Globe](https://github.com/vasturiano/three-globe)
- Weather Data: [OpenWeatherMap](https://openweathermap.org/)
- Icons: Lucide Icons (SVG)

---

Made with ❤️ using React + Three.js
