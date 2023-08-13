import React, { useRef, useState } from 'react'
import { useSetRecoilState } from 'recoil'
import { loading, localCourses } from '../recoil/atom'
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { baseUrl } from './Register';
import { toast } from 'react-hot-toast';

export type Coursetype = {
    title: string,
    description: string,
    imageLink: string,
    price: number,
    published: boolean,
    _id?: string
}

type CourseProps = {
    course: Coursetype,
    updateDel?: boolean
}

const Course: React.FC<CourseProps> = ({ course, updateDel = true }) => {

    const [upadate, setUpdate] = useState<boolean>(false);
    const setLoader = useSetRecoilState(loading);
    const navigate = useNavigate();
    const setLocalCourses = useSetRecoilState(localCourses);
    const [published, setPub] = useState<boolean>(false);
    const titleRef = useRef<HTMLInputElement | null>(null);
    const descRef = useRef<HTMLTextAreaElement | null>(null);
    const price = useRef<HTMLInputElement | null>(null);
    const imageLink = useRef<HTMLInputElement | null>(null);


    const handlePut = () => {
        setUpdate(true);
    }

    const handleSubmit = (e: any) => {
        e.preventDefault();
        setLoader(true);
        axios({
            url: `/admin/courses/${course._id}`,
            baseURL: baseUrl,
            method: "PUT",
            headers: {
                Authorization: sessionStorage.getItem("token"),
                "Content-Type": "application/json"
            },
            data: {
                title: titleRef?.current?.value || course.title,
                description: descRef?.current?.value || course.description,
                price: price?.current?.value || course.price,
                imageLink: imageLink?.current?.value || course.imageLink,
                published: published || course.published
            }
        }).then(response => {
            setLocalCourses((prev: Coursetype[]) => {
                const updatedCourse = prev.map((c) => {
                    if (c._id == course._id) {
                        return {
                            title: titleRef?.current?.value || course.title,
                            description: descRef?.current?.value || course.description,
                            price: price?.current?.value || course.price,
                            imageLink: imageLink?.current?.value || course.imageLink,
                            published: published || course.published,
                            _id: course._id
                        }
                    }
                    return c;
                });
                return updatedCourse;
            });
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
            setUpdate(false);
            setLoader(false);
        }).catch(err => {
            console.log(err);
            if (err) {
                toast.error(err.message);
                setLoader(false);
                if (err.response.status == 403) {
                    toast.error("Please Log in");
                    sessionStorage.clear();
                    navigate("/")
                }
            }
        })
    }

    const handleDelete = () => {
        setLoader(true);
        axios({
            method: "DELETE",
            url: `/admin/courses/${course._id}`,
            baseURL: baseUrl,
            headers: {
                Authorization: sessionStorage.getItem("token"),
                "Content-Type": "application/json"
            }
        }).then(response => {
            setLocalCourses((prev: Coursetype[]) => {
                const updatedCourses = prev.filter((c: Coursetype) => c._id != course._id);
                return updatedCourses;
            });
            toast.success(response.data.message);
            setLoader(false);
        }).catch(err => {
            console.log(err);
            if (err) {
                toast.error(err.response.data.message);
                setLoader(false);
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

            {upadate &&
                <>
                    <div
                        onClick={() => setUpdate(false)}
                        className="bg-cover z-0 w-full h-screen inset-0 fixed backdrop-blur-2xl p-6 flex items-center justify-center transition-all">
                    </div>
                    <form onSubmit={handleSubmit} className="fixed top-1/4 z-50 bg-white p-8 w-[500px] rounded-lg shadow-md  hover:shadow-xl transition-all ease-in-out">
                        <h2 className="text-2xl font-semibold mb-4">Update Course Id: {course._id}</h2>
                        <div className="mb-4">
                            <label htmlFor="courseName" className="block text-sm font-medium text-gray-600 mb-1">
                                Course Title
                            </label>
                            <input
                                ref={titleRef}
                                id="courseName"
                                type="text"
                                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                                placeholder="Course Name (all remains same if not updated)"
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
                                />
                            </div>
                        </div>
                        <div className="mb-4 mt-7 flex flex-row justify-between">

                            <label htmlFor="published" className=" font-medium  mb-1 flex flex-row gap-x-3 text-base">
                                <input
                                    id="published"
                                    type="checkbox"
                                    checked={published}
                                    onChange={() => setPub(!published)}
                                    className="w-fit inline border rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                                />
                                <span className="text-gray-600 font-normal flex text-center justify-center items-center">Publish?</span>
                            </label>
                            <div className="flex flex-row items-center justify-center gap-x-5">

                                <button
                                    type="submit"
                                    className="w-fit bg-blue-500 text-white rounded-lg px-5 py-2 font-medium hover:bg-blue-600"
                                >
                                    Update Course
                                </button>
                                <button
                                    type="button"
                                    className="w-fit px-5  bg-red-600 text-white rounded-lg py-2 font-medium hover:bg-red-500 transition-all"
                                    onClick={() => setUpdate(false)}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </form>
                </>}


            <div>
                <div className="bg-white rounded-xl shadow-md p-6 w-[400px] z-0 hover:shadow-2xl transition-all cursor-pointer">
                    <Link to={`/courses/${course._id}`}>
                        <img src={course.imageLink} alt={course.title} className="w-full h-auto mb-4 rounded-lg" />
                        <h2 className="text-lg font-semibold mb-2">{course.title}</h2>
                        <p className="text-gray-600 mb-2">{course.description}</p>
                        <p className="text-green-600 font-semibold mb-2">Price: ${course.price}</p>
                    </Link>
                    <div className="flex flex-row gap-x-5 justify-between items-center">
                        <p className={`text-sm ${course.published ? 'text-green-600' : 'text-red-600'} flex text-center`}>
                            {course.published ? 'Published' : 'Not Published'}
                        </p>
                        {updateDel && <div className="flex flex-row gap-x-3">

                            <button
                                type="button"
                                className="w-fit px-5 text-sm bg-blue-500 text-white rounded-lg py-2 font-medium hover:bg-blue-600 transition-all"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handlePut();
                                }}
                            >
                                Update
                            </button>
                            <button
                                type="button"
                                className="w-fit px-5 text-sm bg-red-600 text-white rounded-lg py-2 font-medium hover:bg-red-500 transition-all"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete();
                                }}
                            >
                                Delete
                            </button>
                        </div>}
                    </div>
                </div>

            </div>
        </>
    )
}

export default Course