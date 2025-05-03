import { Link } from "react-router-dom";
import { useState } from "react";
import CampusLoopLogo from "../../../logo/CampusLoop.png";
import collegeList from "../../../constants/collegeList";
import courseList from "../../../constants/courseList";
import Select from "react-select";
import { MdOutlineMail, MdPassword } from "react-icons/md";
import { FaUser } from "react-icons/fa";
import { MdDriveFileRenameOutline } from "react-icons/md";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

// Reusable custom styles
const customStyles = {
  control: (provided) => ({
    ...provided,
    backgroundColor: 'transparent',
    border: '1px solid #4b4b4b',
    color: 'white',
    boxShadow: 'none',
    '&:hover': {
      borderColor: '#888',
    },
  }),
  singleValue: (provided) => ({
    ...provided,
    color: 'white',
  }),
  menu: (provided) => ({
    ...provided,
    backgroundColor: '#1f1f1f',
    color: 'white',
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isFocused ? '#4e4ef5' : 'transparent',
    color: state.isFocused ? 'white' : 'white',
    cursor: 'pointer',
  }),
  placeholder: (provided) => ({
    ...provided,
    color: '#aaa',
  }),
};

const SignUpPage = () => {
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    fullName: "",
    password: "",
    collegeName: "",
    course: "",
    batchYear: "",
    userRole: "Student",
    isAvailableForMentorship: false,
  });

  const queryClient = useQueryClient();
  const { mutate, isError, isPending, error } = useMutation({
    mutationFn: async (formData) => {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "Signup failed");
      return data;
    },
    onSuccess: () => {
      toast.success("Account created successfully");
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutate(formData);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
  };

  // react-select handlers
  const handleCollegeChange = (selectedOption) => {
    setFormData({ ...formData, collegeName: selectedOption.value });
  };

  const handleCourseChange = (selectedOption) => {
    setFormData({ ...formData, course: selectedOption.value });
  };

  // react-select options
  const collegeOptions = collegeList.map((college) => ({
    label: college,
    value: college,
  }));

  const courseOptions = courseList.map((course) => ({
    label: course,
    value: course,
  }));

  const batchYearOptions = Array.from({ length: 16 }, (_, i) => ({
    label: `${2015 + i}`,
    value: 2015 + i,
  }));

  return (
    <div className="max-w-screen-xl mx-auto flex h-screen px-10">
      <div className="flex-1 hidden lg:flex flex-col items-center justify-center">
        <img src={CampusLoopLogo} alt="Campus Loop Logo" className="w-90 mb-4" />
        <p className="text-white text-xl font-semibold">"Your college network, beyond college"</p>
        <p className="text-gray-300 mt-2">Welcome! Sign up to get started</p>
      </div>

      <div className="flex-1 flex flex-col justify-center items-center">
        <form className="lg:w-2/3 mx-auto md:mx-20 flex gap-4 flex-col mt-10" onSubmit={handleSubmit}>
          <img src={CampusLoopLogo} alt="Campus Loop Logo" className="w-40 mx-auto lg:hidden" />
          <p className="text-white text-center text-lg font-semibold lg:hidden">Your college network beyond college</p>
          <p className="text-gray-300 text-center mb-4 lg:hidden">Welcome! Sign up to get started</p>

          <label className="input input-bordered rounded flex items-center gap-2">
            <MdOutlineMail />
            <input
              type="email"
              className="grow"
              placeholder="Email"
              name="email"
              onChange={handleInputChange}
              value={formData.email}
            />
          </label>

          <div className="flex gap-4 flex-wrap">
            <label className="input input-bordered rounded flex items-center gap-2 flex-1">
              <FaUser />
              <input
                type="text"
                className="grow"
                placeholder="Username"
                name="username"
                onChange={handleInputChange}
                value={formData.username}
              />
            </label>

            <label className="input input-bordered rounded flex items-center gap-2 flex-1">
              <MdDriveFileRenameOutline />
              <input
                type="text"
                className="grow"
                placeholder="Full Name"
                name="fullName"
                onChange={handleInputChange}
                value={formData.fullName}
              />
            </label>
          </div>

          <label className="input input-bordered rounded flex items-center gap-2">
            <MdPassword />
            <input
              type="password"
              className="grow"
              placeholder="Password"
              name="password"
              onChange={handleInputChange}
              value={formData.password}
            />
          </label>

          <Select
            options={collegeOptions}
            placeholder="Select Your College"
            styles={customStyles}
            onChange={handleCollegeChange}
            value={collegeOptions.find((c) => c.value === formData.collegeName)}
          />

          <Select
            options={courseOptions}
            placeholder="Select Your Course"
            styles={customStyles}
            onChange={handleCourseChange}
            value={courseOptions.find((c) => c.value === formData.course)}
          />

          <Select
            options={batchYearOptions}
            placeholder="Select Batch Year"
            styles={customStyles}
            onChange={(selectedOption) => setFormData({ ...formData, batchYear: selectedOption.value })}
            value={batchYearOptions.find((b) => b.value === formData.batchYear)}
          />

          <select
            name="userRole"
            value={formData.userRole}
            onChange={handleInputChange}
            className="select select-bordered w-full text-white"
          >
            <option value="Student">Student (1st Year)</option>
            <option value="Senior">Senior</option>
            <option value="Alumni">Alumni</option>
          </select>

          <label className="label cursor-pointer flex gap-3">
            <span className="label-text text-white">Available for Mentorship?</span>
            <input
              type="checkbox"
              name="isAvailableForMentorship"
              className="checkbox checkbox-primary"
              checked={formData.isAvailableForMentorship}
              onChange={handleInputChange}
            />
          </label>

          <button className="btn rounded-full btn-primary text-white">
            {isPending ? "Loading..." : "Sign Up"}
          </button>

          {isError && <p className="text-red-500">{error.message}</p>}
        </form>
      </div>
    </div>
  );
};

export default SignUpPage;
