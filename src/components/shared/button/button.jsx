export const Button = ({
  type = "submit",
  id,
  children,
  classes = "",
  onClick
}) => {
  const defaultClasses = `flex justify-center rounded-md bg-theme-color-1 px-5 py-3 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600`;
  const combinedClasses = `${defaultClasses} ${classes}`;
  return (
    <button id={id} type={type} className={combinedClasses} onClick={onClick}>
      {children}
    </button>
  );
};
