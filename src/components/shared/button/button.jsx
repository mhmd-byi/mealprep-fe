import { motion } from "framer-motion";

export const Button = ({
  type = "submit",
  id = undefined,
  children = undefined,
  classes = "",
  onClick = undefined,
  disabled = undefined
}) => {
  const defaultClasses = `flex justify-center rounded-md bg-theme-color-1 px-5 py-3 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600`;
  const disabledBtnClasses = "!bg-[#295f3f] !cursor-not-allowed !pointer-events-none"
  const combinedClasses = `${defaultClasses} ${classes} ${disabled === true ? disabledBtnClasses : ""}`;
  return (
    <motion.button
      id={id}
      type={type}
      className={combinedClasses}
      onClick={onClick}
      disabled={disabled}
      whileHover={disabled ? undefined : { scale: 1.015 }}
      whileTap={disabled ? undefined : { scale: 0.96 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
    >
      {children}
    </motion.button>
  );
};
