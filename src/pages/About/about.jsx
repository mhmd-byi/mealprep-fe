import React from "react";

const About = () => {
  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-8">About Us</h1>

      {/* About Us Text */}
      <p className="text-gray-700 leading-loose">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed ut
        perspiciatis unde omnis iste natus error sit voluptatem accusantium
        doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo
        inventore veritatis et quasi architecto beatae vitae dicta sunt
        explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut
        odit aut fugit, sed quia consequuntur magni dolores eos qui ratione
        voluptatem sequi nesciunt.
      </p>

      {/* Team Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
        <div className="flex flex-col items-center">
          <img
            className="w-32 h-32 rounded-full mx-auto mb-4"
            src="https://via.placeholder.com/150"
            alt="Team Member 1"
          />
          <h3 className="text-lg font-bold mb-2">John Doe</h3>
          <p className="text-gray-700 text-center">Founder & CEO</p>
        </div>
        <div className="flex flex-col items-center">
          <img
            className="w-32 h-32 rounded-full mx-auto mb-4"
            src="https://via.placeholder.com/150"
            alt="Team Member 2"
          />
          <h3 className="text-lg font-bold mb-2">Jane Smith</h3>
          <p className="text-gray-700 text-center">Lead Developer</p>
        </div>
        <div className="flex flex-col items-center">
          <img
            className="w-32 h-32 rounded-full mx-auto mb-4"
            src="https://via.placeholder.com/150"
            alt="Team Member 3"
          />
          <h3 className="text-lg font-bold mb-2">Michael Brown</h3>
          <p className="text-gray-700 text-center">Marketing Manager</p>
        </div>
      </section>
    </div>
  );
};

export default About;
