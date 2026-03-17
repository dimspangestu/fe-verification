import { CiMail } from "react-icons/ci";
import Image from "next/image";
import graduationIcon from "@/assets/icon/magistrate.png";
export const listInformationProfile = [
    {
        type: "education",
        faculty: "Faculty of Social Sciences",
        prodi: "Master’s Study Program of Political Science",
        year: "2021-2022",
        icon: () => {
            return (
                <Image src={graduationIcon} />
            )
        }
    },
    {
        type: "email",
        text: "jane.doe@uiii.ac.id",
        icon: () => {
            return (
                <CiMail size={24} />
            )
        }
    }
]

export const descriptionProfile = "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book"