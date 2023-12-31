import axios from "axios";
import React, { useRef, useState } from "react";
import { baseUrl } from "./Register";
import { useSetRecoilState } from "recoil";
import { loading, localCourses } from "../recoil/atom";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Coursetype } from "./Course";
/// You need to add input boxes to take input for users to create a course.
/// I've added one input so you understand the api to do it.
// Headers: { 'Authorization': 'Bearer jwt_token_here' },
// Body: { title: 'updated course title', 
// description: 'updated course description', price: 100, 
// imageLink: 'https://updatedlinktoimage.com', published: false } 
// Output: { message: 'Course updated successfully' }

const CreateCourse: React.FC = () => {

    const setLoader = useSetRecoilState(loading);
    const navigate = useNavigate();
    const setLocalCourses = useSetRecoilState(localCourses);
    const [published, setPub] = useState<boolean>(false);
    const titleRef = useRef<HTMLInputElement | null>(null);
    const descRef = useRef<HTMLTextAreaElement | null>(null);
    const price = useRef<HTMLInputElement | null>(null);
    const imageLink = useRef<HTMLInputElement | null>(null);

    const handleSubmit = (e: any) => {
        e.preventDefault();
        setLoader(true);
        const body: Coursetype = {
            title: titleRef?.current?.value || '',
            description: descRef?.current?.value || '',
            price: parseInt(price?.current?.value || '0'),
            imageLink: imageLink?.current?.value || '',
            published: published
        }
        axios({
            url: `${baseUrl}/admin/courses`,
            method: "POST",
            headers: {
                Authorization: (sessionStorage.getItem("token") || '').toString(),
                "Content-type": "application/json"
            },
            data: body
        }).then(response => {
            const createdCourse = response.data.course;
            setLocalCourses((prev: Coursetype[]) => [...prev, createdCourse])
            if (titleRef.current) {
                titleRef.current.value = '';
            }

            if (descRef.current) {
                descRef.current.value = '';
            }

            if (price.current) {
                price.current.value = '';
            }

            if (imageLink.current) {
                imageLink.current.value = '';
            }
            setPub(false);
            toast.success(response.data.message);
            navigate("/courses");
        }).catch(err => {
            console.log(err)
            if (err) {
                toast.error(err.message);
                if (err.response.status == 403) {
                    toast.error("Please Log in");
                    sessionStorage.clear();
                    navigate("/")
                }
            }
        })
    }

    return (
        <>
            <div className="flex items-center justify-center min-h-screen bg-gray-200">
                <form onSubmit={handleSubmit} className="bg-white p-8 w-[500px] rounded-lg shadow-md  hover:shadow-xl transition-all ease-in-out">
                    <h2 className="text-2xl font-semibold mb-4">Create New Course</h2>
                    <div className="mb-4">
                        <label htmlFor="courseName" className="block text-sm font-medium text-gray-600 mb-1">
                            Course Title
                        </label>
                        <input
                            ref={titleRef}
                            id="courseName"
                            type="text"
                            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                            placeholder="Course Name"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="courseDescription" className="block text-sm font-medium text-gray-600 mb-1">
                            Course Description
                        </label>
                        <textarea
                            ref={descRef}
                            id="courseDescription"
                            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                            placeholder="Course Description"
                            rows={4}
                            maxLength={150}
                            required
                        />
                    </div>
                    <div className="mb-4 flex flex-row gap-x-6 justify-center items-center">
                        <div className="">
                            <label htmlFor="imageInput" className="block text-sm font-medium text-gray-600 mb-1">
                                Image Link
                            </label>
                            <input
                                ref={imageLink}
                                id="imageInput"
                                type="text"
                                // accept="image/*"
                                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 cursor-pointer"
                                required
                            />
                        </div>
                        <div className="">
                            <label htmlFor="price" className="block text-sm font-medium text-gray-600 mb-1">
                                Price
                            </label>
                            <input
                                ref={price}
                                id="price"
                                type="number"
                                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                                placeholder="In ﹩ please"
                                required
                            />
                        </div>
                    </div>
                    <div className="mb-4 ">

                        <label htmlFor="published" className=" font-medium  mb-1 flex flex-row gap-x-3 text-base">
                            <input
                                id="published"
                                type="checkbox"
                                checked={published}
                                onChange={() => setPub(!published)}
                                className="w-fit inline border rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                            />
                            <span className="text-gray-600 font-normal">Publish?</span>
                        </label>
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-500 text-white rounded-lg py-2 font-medium hover:bg-blue-600"
                    >
                        Create Course
                    </button>
                </form>
            </div>

        </>
    )
}
export default CreateCourse;