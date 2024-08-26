import React, { useState } from "react";
import { Button, Input, FileUpload } from "../../../components";
import DashboardLayoutComponent from "../../../components/common/Dashboard/Dashboard";
import { Helmet } from "react-helmet";
import useAddMeal from "./useAddMeal";
import IconButton from "@mui/material/IconButton";
import { Add, Delete, CloudUpload } from "@mui/icons-material";

const AddMeal = () => {
  const {
    mealData,
    isLoading,
    handleDateChange,
    handleMealTypeChange,
    handleItemChange,
    addNewItem,
    removeItem,
    handleSubmit,
    setMealImage,
    handleImageUpload,
    mealImage,
  } = useAddMeal();
  const [activeTab, setActiveTab] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: "" });

  const handleTabClick = (index) => {
    setActiveTab(index);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      await handleSubmit(e);
      setSnackbar({ open: true, message: "Meal added successfully!" });
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Failed to add meal. Please try again.",
      });
    }
  };

  const handleImageUploadClick = async () => {
    if (!mealData.date || !mealImage) {
      setSnackbar({
        open: true,
        message: "Please select both a date and an image.",
      });
      return;
    }

    try {
      const success = await handleImageUpload();
      if (success) {
        setSnackbar({ open: true, message: "Image uploaded successfully!" });
      } else {
        setSnackbar({
          open: true,
          message: "Failed to upload image. Please try again.",
        });
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Failed to upload image. Please try again.",
      });
    }
  };

  return (
    <DashboardLayoutComponent>
      <Helmet>
        <title>Add Menu | Mealprep</title>
      </Helmet>
      <div className="flex flex-col justify-center items-center p-2 sm:p-5 w-full h-full text-left">
        <div className="bg-white shadow-lg rounded-lg p-4 sm:p-8 w-full max-w-4xl">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 text-gray-800">
            Add Menu
          </h2>
          <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row gap-2 sm:gap-6">
            <button
              onClick={() => handleTabClick(0)}
              className={`flex justify-center rounded-md px-4 py-2 sm:px-5 sm:py-3 text-sm font-semibold leading-6 shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
                activeTab === 0
                  ? "bg-theme-color-1 hover:bg-theme-color-1 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              Meal Details
            </button>
            <button
              onClick={() => handleTabClick(1)}
              className={`flex justify-center rounded-md px-4 py-2 sm:px-5 sm:py-3 text-sm font-semibold leading-6 shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
                activeTab === 1
                  ? "bg-theme-color-1 hover:bg-theme-color-1 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              Image Upload
            </button>
          </div>
          {activeTab === 0 && (
            <form onSubmit={handleFormSubmit}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                    Date
                  </label>
                  <Input
                    type="date"
                    value={mealData.date}
                    onChange={handleDateChange}
                    className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                    Meal Type
                  </label>
                  <Input
                    type="select"
                    value={mealData.mealType}
                    onChange={handleMealTypeChange}
                    className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5"
                    placeholder="Select Meal Type"
                    options={[
                      { value: "lunch", label: "Lunch" },
                      { value: "dinner", label: "Dinner" },
                    ]}
                  />
                </div>
              </div>

              <div className="mb-4 sm:mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2 sm:mb-4">
                  Meal Items
                </h3>
                <div className="max-h-[50vh] sm:max-h-[75vh] overflow-y-auto pr-2">
                  {mealData.items.map((item, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_1fr_1fr_10px] gap-2 sm:gap-4 items-center mb-4 p-2 sm:p-4 bg-gray-100 rounded-lg"
                    >
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Item Name
                        </label>
                        <Input
                          type="text"
                          value={item.name}
                          onChange={(e) =>
                            handleItemChange(index, "name", e.target.value)
                          }
                          placeholder="Meal name"
                          className="w-full bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Description
                        </label>
                        <Input
                          type="text"
                          value={item.description}
                          onChange={(e) =>
                            handleItemChange(
                              index,
                              "description",
                              e.target.value
                            )
                          }
                          placeholder="Description"
                          className="w-full bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Weight
                        </label>
                        <Input
                          type="text"
                          value={item.weight}
                          onChange={(e) =>
                            handleItemChange(index, "weight", e.target.value)
                          }
                          placeholder="Weight"
                          className="w-full bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Type
                        </label>
                        <Input
                          type="select"
                          value={item.type}
                          onChange={(e) =>
                            handleItemChange(index, "type", e.target.value)
                          }
                          className="w-full bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2"
                          placeholder="Select Meal Type"
                          options={[
                            { value: "Veg", label: "Veg" },
                            { value: "Non Veg", label: "Non Veg" },
                          ]}
                        />
                      </div>
                      <div className="flex items-center justify-center sm:justify-end mt-2 sm:mt-0">
                        {index > 0 && (
                          <IconButton
                            onClick={() => removeItem(index)}
                            color="error"
                          >
                            <Delete />
                          </IconButton>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-start mb-4">
                <button
                  type="button"
                  onClick={addNewItem}
                  className="flex justify-center rounded-md bg-transparent-1 px-4 py-2 sm:px-5 sm:py-3 text-sm font-semibold leading-6 text-theme-color-1 shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 border-2 border-theme-color-1"
                >
                  Add Item
                  <Add className="ml-1" />
                </button>
              </div>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
                >
                  {isLoading ? "Submitting..." : "Submit"}
                </Button>
              </div>
            </form>
          )}
          {activeTab === 1 && (
            <div>
              <div className="mb-4 sm:mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  Date
                </label>
                <Input
                  type="date"
                  value={mealData.date}
                  onChange={handleDateChange}
                  className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5"
                />
              </div>
              <FileUpload
                onFileChange={(file) => setMealImage(file)}
                label="Upload Meal Image"
                multiple={false}
                maxFiles={1}
                maxSizeInMB={5}
                key={mealData.date}
              />
              <div className="flex justify-end mt-4">
                <Button
                  onClick={handleImageUploadClick}
                  disabled={isLoading || !mealData.date || !mealImage}
                  className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
                >
                  <CloudUpload className="mr-1" />
                  {isLoading ? "Uploading..." : "Upload Image"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
      {snackbar.open && (
        <div className="fixed bottom-4 right-4 bg-gray-800 text-white px-4 py-2 rounded-md">
          {snackbar.message}
        </div>
      )}
    </DashboardLayoutComponent>
  );
};

export default AddMeal;
