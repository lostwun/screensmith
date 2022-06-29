import React from "react";
import _ from "lodash";
import PropTypes from "prop-types";

import { frameworkComponents } from "./ScreenSmith.api";

const ScreenSmithUnMemoized = ({
  definition,
  componentMap,
  functionMap,
  stateMap,
}) => {
  const LayoutComponents = { ...componentMap, ...frameworkComponents };

  const renderChildrenElements = (
    _children,
    _componentMap,
    _functionMap,
    _stateMap
  ) => {
    let functionPropObj = {};
    let stateAssignmentObj = [];
    const childrenElements = _children.map((el) => {
      const {
        ComponentType,
        Children,
        UiElementId,
        ComponentProperties,
        Representation,
        Actions,
        State,
      } = el;

      // handle events for componen
      if (!_.isNil(Actions)) {
        Actions.map(({ type, action }) => {
          functionPropObj = {
            ...functionPropObj,
            [type]: _functionMap[action],
          };
        });
      }

      // set state if availabl
      if (!_.isNil(State)) {
        State.map(({ property, stateValue }) => {
          stateAssignmentObj = {
            ...stateAssignmentObj,
            [property]: _stateMap[stateValue],
          };
        });
      }

      if (!_.isNil(LayoutComponents[ComponentType])) {
        return React.createElement(
          LayoutComponents[ComponentType],
          {
            id: UiElementId,
            ...functionPropObj,
            ...stateAssignmentObj,
            ...ComponentProperties,
          },
          ComponentType === "Divider"
            ? undefined
            : !_.isNil(Children) && !_.isEmpty(Children)
            ? renderChildrenElements(
                Children,
                _componentMap,
                _functionMap,
                _stateMap
              )
            : `${Representation}`
        );
      } else {
        // handle unfound component type with error message
        return React.createElement(
          frameworkComponents["AOAlert"],
          {
            severity: "error",
            message: `Error: Component type ${ComponentType} not found.`,
          },
          null
        );
      }
    });

    return childrenElements;
  };

  return definition.map((def) => {
    const { Children } = def;
    return renderChildrenElements(
      Children,
      componentMap,
      functionMap,
      stateMap
    );
  });
};

ScreenSmithUnMemoized.propTypes = {
  children: PropTypes.node,
  definition: PropTypes.array,
  componentMap: PropTypes.object,
  functionMap: PropTypes.object,
  stateMap: PropTypes.object,
};

const ScreenSmith = React.memo(ScreenSmithUnMemoized);

ScreenSmith.displayName = "ScreenSmith";

export default ScreenSmith;
