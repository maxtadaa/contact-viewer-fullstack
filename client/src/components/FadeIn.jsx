import { motion } from "framer-motion";

// ใช้ครอบ "กลุ่ม" ที่จะให้ลูกๆ ค่อยๆ โผล่ทีละชิ้น
export function FadeInStagger({ children, className }) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.55, delayChildren: 0.1 } },
      }}
    >
      {children}
    </motion.div>
  );
}

// ใช้ครอบ "แต่ละชิ้น" ที่อยู่ข้างใน FadeInStagger
export function FadeInItem({ children, className }) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
      }}
    >
      {children}
    </motion.div>
  );
}
