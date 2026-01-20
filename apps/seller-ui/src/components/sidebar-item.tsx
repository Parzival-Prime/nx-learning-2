import Link from "next/link";

export default function SidebarItem({icon, title, href, isActive}: Props) {
  return (
    <Link href={href} className="my-2.5 block">
      <div className={`flex gap-2 w-full min-h-8 items-center px-3.25 rounded-md cursor-pointer transition hover:bg-neutral-800 ${isActive && "scale-[0.98]  bg-[#0f3158] fill-blue-200 hover:bg-[#0f3158d6]!"}`}>
        {icon}
        <h5 className={`${isActive ? "text-neutral-100" : "text-neutral-300"} text-sm`}>{title}</h5>
      </div>
    </Link>
  )
}


interface Props {
  title: string;
  icon: React.ReactNode;
  isActive?: Boolean;
  href: string;
}