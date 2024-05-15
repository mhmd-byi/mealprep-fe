export const Button = ({
  type = "submit",
  id,
  children,
  classes = "flex w-full justify-center rounded-md bg-theme-color-1 px-5 py-3 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600",
}) => {
  return (
    <button id={id} type={type} className={classes}>
      {children}
    </button>
  );
};
