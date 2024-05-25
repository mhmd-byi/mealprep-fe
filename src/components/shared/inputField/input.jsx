export const Input = ({
    type = 'text',
    onChange,
    id,
    name,
    placeholder,
    required = false,
    classes = 'block w-full h-12 rounded-lg border-0 px-5 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-1 focus:ring-inset focus:theme-color-1 sm:text-sm sm:leading-6 focus:border-theme-color-1',
}) => {
    return (
        <input type={type} onChange={onChange} required={required} id={id} name={name} placeholder={placeholder} className={classes} />
    );
}