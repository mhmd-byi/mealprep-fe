import React, { useEffect, useState } from "react";
import { Button, Input, FileUpload } from "../../../components";
import DashboardLayoutComponent from "../../../components/common/Dashboard/Dashboard";
import { Helmet } from "react-helmet";
import useAddMeal from "./useAddMeal";
import IconButton from "@mui/material/IconButton";
import { Add, Delete, CloudUpload } from "@mui/icons-material";
import { ImageMenu } from "../../../components/common/ImageMenu";
import { Toaster } from "react-hot-toast";

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
    mealImages,
    setMealImages,
    handleMultipleImageUpload,
    getCurrentDate,
    menuImages,
    imagesLoading,
    deleteAnImage,
    getMealItemsInText,
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
      setSnackbar({ open: true, message: "Menu added successfully!" });
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Failed to add menu. Please try again.",
      });
    }
  };

  const handleImageUploadClick = async () => {
    if (!mealData.date || !mealImages) {
      setSnackbar({
        open: true,
        message: "Please select both a date and an image.",
      });
      return;
    }

    try {
      const success = await handleMultipleImageUpload();
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
      <div className="flex flex-col justify-center items-center p-4 sm:p-6 md:p-8 w-full min-h-screen">
        <div className="bg-white shadow-lg rounded-lg p-4 sm:p-6 md:p-8 w-full max-w-4xl">
          <h2 className="text-2xl sm:text-3xl font-semibold mb-6 text-gray-800">
            Add Menu
          </h2>
          <div className="mb-6 flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => handleTabClick(0)}
              className={`flex-1 justify-center rounded-md px-4 py-2 sm:px-5 sm:py-3 text-sm font-semibold leading-6 shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
                activeTab === 0
                  ? "bg-theme-color-1 hover:bg-theme-color-1 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Meal Details
            </button>
            <button
              onClick={() => handleTabClick(1)}
              className={`flex-1 justify-center rounded-md px-4 py-2 sm:px-5 sm:py-3 text-sm font-semibold leading-6 shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
                activeTab === 1
                  ? "bg-theme-color-1 hover:bg-theme-color-1 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Image Upload
            </button>
          </div>
          {activeTab === 0 && (
            <form onSubmit={handleFormSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date
                  </label>
                  <Input
                    type="date"
                    value={mealData.date}
                    onChange={handleDateChange}
                    min={getCurrentDate()}
                    className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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

              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Meal Items
                </h3>
                <div className="max-h-[50vh] sm:max-h-[60vh] overflow-y-auto pr-2 space-y-4">
                  {mealData.items.map((item, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-1 sm:grid-cols-2 md:flex md:items-end gap-4 items-center p-4 bg-gray-100 rounded-lg"
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
                          Weight (add separator for multiple values)
                        </label>
                        <Input
                          type="text"
                          value={item.weight}
                          onChange={(e) =>
                            handleItemChange(index, "weight", e.target.value)
                          }
                          placeholder="Weight"
                        />
                      </div>
                      <div className="flex flex-col">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Type
                        </label>
                        <div className="flex items-center">
                          <Input
                            type="select"
                            value={item.type}
                            onChange={(e) =>
                              handleItemChange(index, "type", e.target.value)
                            }
                            className="flex-grow bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2"
                            placeholder="Select Meal Type"
                            options={[
                              { value: "Veg", label: "Veg" },
                              { value: "Non Veg", label: "Non Veg" },
                            ]}
                          />
                          {index > 0 && (
                            <IconButton
                              onClick={() => removeItem(index)}
                              color="error"
                              className="ml-2"
                            >
                              <Delete />
                            </IconButton>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center">
                <button
                  type="button"
                  onClick={addNewItem}
                  className="flex items-center justify-center rounded-md bg-transparent px-4 py-2 text-sm font-semibold text-theme-color-1 shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 border-2 border-theme-color-1 hover:bg-theme-color-1 hover:text-white transition-colors duration-300"
                >
                  Add Item
                  <Add className="ml-1" />
                </button>
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
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date
                </label>
                <Input
                  type="date"
                  value={mealData.date}
                  onChange={handleDateChange}
                  // min={getCurrentDate()}
                  className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5"
                />
              </div>
              {imagesLoading ? (
                <div>Loading images...</div>
              ) : (
                menuImages.length > 0 && mealData.date && (
                  <ImageMenu images={menuImages} handleDelete={deleteAnImage} currentDate={mealData.date} />
                )
              )}
              <FileUpload
                onFileChange={(files) => setMealImages(files)}
                label="Upload Meal Images"
                multiple={true}
                maxFiles={5}
                maxSizeInMB={5}
                key={mealData.date}
              />
              {mealImages.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600">
                    {mealImages.length} image(s) selected
                  </p>
                </div>
              )}
              <div className="flex justify-end">
                <Button
                  onClick={handleImageUploadClick}
                  disabled={
                    isLoading || !mealData.date || mealImages.length === 0
                  }
                  className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 flex items-center"
                >
                  <CloudUpload className="mr-2" />
                  {isLoading ? "Uploading..." : "Upload Images"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
      {snackbar.open && (
        <div className="fixed bottom-4 right-4 bg-gray-800 text-white px-4 py-2 rounded-md shadow-lg">
          {snackbar.message}
        </div>
      )}
      <Toaster />
    </DashboardLayoutComponent>
  );
};

export default AddMeal;
