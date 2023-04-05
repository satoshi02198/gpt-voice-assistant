import React from 'react';
import { Accordion } from 'flowbite-react';

const AccordionComponent = () => {
  return (
    <Accordion alwaysOpen={false}>
      <Accordion.Panel>
        <Accordion.Title className="bg-gray-300 hover:bg-gray-300">
          What is Flowbite?
        </Accordion.Title>
        <Accordion.Content className="bg-gray-200">
          <p className=" ">
            Flowbite is an open-source library of interactive components built
            on top of Tailwind CSS including buttons, dropdowns, modals,
            navbars, and more.
          </p>
        </Accordion.Content>
      </Accordion.Panel>
    </Accordion>
  );
};

export default AccordionComponent;
