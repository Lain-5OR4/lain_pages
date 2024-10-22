import type { SimpleIcon } from "simple-icons";

type IconArgs = {
	color?: string;
	icon: SimpleIcon;
	size?: number;
	title?: string;
};

const Icon = ({
	color = "currentColor",
	icon,
	size = 24,
	title = icon.title,
	...others
}: IconArgs) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={size}
			height={size}
			fill={color}
			viewBox="0 0 24 24"
			{...others}
		>
			<title>{title}</title>
			<path d={icon.path} />
		</svg>
	);
};

export default Icon;
