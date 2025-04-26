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
    <button id={id} type={type} className={combinedClasses} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
};
