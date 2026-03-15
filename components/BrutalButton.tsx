"use client";

type Props = {
  label: string;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  onClickFn?: () => void;
  variant?: "default" | "danger";
};

export default function BrutalButton({
                                       label,
                                       type = "button",
                                       disabled,
                                       onClickFn,
                                       variant = "default",
                                     }: Props) {

  const base =
    "px-8 py-0.5 border-2 uppercase transition duration-200 text-sm hover:cursor-pointer shadow-[1px_1px_rgba(0,0,0),2px_2px_rgba(0,0,0),3px_3px_rgba(0,0,0),4px_4px_rgba(0,0,0),5px_5px_0px_0px_rgba(0,0,0)]";

  const variants = {
    default:
      "border-black bg-white text-black dark:border-white dark:bg-black dark:text-white dark:shadow-[1px_1px_rgba(255,255,255),2px_2px_rgba(255,255,255),3px_3px_rgba(255,255,255),4px_4px_rgba(255,255,255),5px_5px_0px_0px_rgba(255,255,255)]",

    danger:
      "border-red-600 bg-white text-red-600 shadow-[1px_1px_rgba(220,38,38),2px_2px_rgba(220,38,38),3px_3px_rgba(220,38,38),4px_4px_rgba(220,38,38),5px_5px_0px_0px_rgba(220,38,38)] hover:bg-red-700 hover:text-white",
  };

  return (
    <button
      disabled={disabled}
      type={type}
      onClick={onClickFn}
      className={`${base} ${variants[variant]}`}
    >
      {label}
    </button>
  );
}