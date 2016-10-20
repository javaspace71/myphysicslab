// Copyright 2016 Erik Neumann.  All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the 'License');
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an 'AS IS' BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

goog.provide('myphysicslab.lab.util.AffineTransform');

goog.require('myphysicslab.lab.util.UtilityCore');
goog.require('myphysicslab.lab.util.Vector');

goog.scope(function() {

var NF = myphysicslab.lab.util.UtilityCore.NF;
var UtilityCore = myphysicslab.lab.util.UtilityCore;
var Vector = myphysicslab.lab.util.Vector;

/** Specifies an immutable 2D affine transform.

The affine transform of a point `(x, y)` is given by:

    [  m11  m21  dx  ] [ x ]   [ m11 x + m21 y + dx ]
    [  m12  m22  dy  ] [ y ] = [ m12 x + m22 y + dy ]
    [   0    0    1  ] [ 1 ]   [          1         ]

Rotation by theta:

    [ cos(theta)  -sin(theta)   0 ]
    [ sin(theta)   cos(theta)   0 ]
    [     0            0        1 ]

Scale:

    [  sx   0    0  ]
    [  0   sy    0  ]
    [  0    0    1  ]

Translate:

    [  1    0   dx  ]
    [  0    1   dy  ]
    [  0    0    1  ]

* @param {number} m11
* @param {number} m12
* @param {number} m21
* @param {number} m22
* @param {number} dx
* @param {number} dy
* @constructor
* @final
* @struct
*/
myphysicslab.lab.util.AffineTransform = function(m11, m12, m21, m22, dx, dy) {
  /**
  * @type {number}
  * @private
  */
  this.m11_ = m11;
  /**
  * @type {number}
  * @private
  */
  this.m12_ = m12;
  /**
  * @type {number}
  * @private
  */
  this.m21_ = m21;
  /**
  * @type {number}
  * @private
  */
  this.m22_ = m22;
  /**
  * @type {number}
  * @private
  */
  this.dx_ = dx;
  /**
  * @type {number}
  * @private
  */
  this.dy_ = dy;
};
var AffineTransform = myphysicslab.lab.util.AffineTransform;

if (!UtilityCore.ADVANCED) {
  AffineTransform.prototype.toString = function() {
    return 'AffineTransform{m11_: '+NF(this.m11_)
        +', m12_: '+NF(this.m12_)
        +', m21_: '+NF(this.m21_)
        +', m22_: '+NF(this.m22_)
        +', dx_: '+NF(this.dx_)
        +', dy_: '+NF(this.dy_)
        +'}';
  };
};

/** The identity AffineTransform, which leaves a point unchanged when it is applied.
@type {!myphysicslab.lab.util.AffineTransform}
@const
*/
AffineTransform.IDENTITY = new AffineTransform(1, 0, 0, 1, 0, 0);

/** Multiplies the affine transform of the given context with this AffineTransform.
* @param {!CanvasRenderingContext2D} context the canvas context to modify
*/
AffineTransform.prototype.applyTransform = function(context) {
  context.transform(this.m11_, this.m12_, this.m21_, this.m22_, this.dx_, this.dy_);
};

/** Right-multiply this AffineTransform by the given AffineTransform. This has the
effect that the given AffineTransform will be applied to the input vector before the
current AffineTransform.

Concatenating a transform A to transform B is equivalent to matrix multiplication of
the two transforms. Note that order matters: matrices are applied in right to left order
when transforming a vector

    A B vector = A * (B * vector)

We can think of the B matrix being applied first, then the A matrix.  This method
returns the product with the input `at` matrix on the right

    this * at

The mathematics is as follows: this matrix is on the left, the other `at` matrix is on
the right:

    [  m11  m21  dx  ]  [  a11  a21  ax  ]
    [  m12  m22  dy  ]  [  a12  a22  ay  ]
    [   0    0    1  ]  [   0    0   1   ]

Result is:

    [ (m11*a11 + m21*a12)  (m11*a21 + m21*a22)  (m11*ax + m21*ay + dx) ]
    [ (m12*a11 + m22*a12)  (m12*a21 + m22*a22)  (m12*ax + m22*ay + dy) ]
    [          0                    0                   1              ]

* @param {!myphysicslab.lab.util.AffineTransform} at the AffineTransform matrix to
*   right-multiply this AffineTransform matrix by
* @return {!myphysicslab.lab.util.AffineTransform} the product of this AffineTransform
*   matrix right-multiplied by the `at` AffineTransform matrix
*/
AffineTransform.prototype.concatenate = function(at) {
  var m11 = this.m11_ * at.m11_ + this.m21_ * at.m12_;
  var m12 = this.m12_ * at.m11_ + this.m22_ * at.m12_;
  var m21 = this.m11_ * at.m21_ + this.m21_ * at.m22_;
  var m22 = this.m12_ * at.m21_ + this.m22_ * at.m22_;
  var dx =  this.m11_ * at.dx_  + this.m21_ * at.dy_ + this.dx_;
  var dy =  this.m12_ * at.dx_  + this.m22_ * at.dy_ + this.dy_;
  return new AffineTransform(m11, m12, m21, m22, dx, dy);
};

/** Draw a line to the transformed point.
* @param {number} x horizontal coordinate
* @param {number} y vertical coordinate
* @param {!CanvasRenderingContext2D} context the canvas context to modify
*/
AffineTransform.prototype.lineTo = function(x, y, context) {
  var p = this.transform(x, y);
  context.lineTo(p.getX(), p.getY());
};

/** Sets current position in context to the transformed point.
* @param {number} x horizontal coordinate
* @param {number} y vertical coordinate
* @param {!CanvasRenderingContext2D} context the canvas context to modify
*/
AffineTransform.prototype.moveTo = function(x, y, context) {
  var p = this.transform(x, y);
  context.moveTo(p.getX(), p.getY());
};

/** Concatenates a rotation transformation to this AffineTransform.

The mathematics is as follows: this matrix is on the left, the rotation matrix is on
the right, and the angle is represented by `t`

    [  m11  m21  dx  ]  [ cos(t)  -sin(t)   0 ]
    [  m12  m22  dy  ]  [ sin(t)   cos(t)   0 ]
    [   0    0    1  ]  [  0        0       1 ]

Result is:

    [  (m11*cos(t) + m21*sin(t))  (-m11*sin(t) + m21*cos(t))  0  ]
    [  (m12*cos(t) + m22*sin(t))  (-m12*sin(t) + m22*cos(t))  0  ]
    [              0                          0               1  ]

* @param {number} angle angle in radians to
* @return {!myphysicslab.lab.util.AffineTransform} a new AffineTransform equal to
*     this AffineTransform rotated by the given angle
*/
AffineTransform.prototype.rotate = function(angle) {
  var c = Math.cos(angle);
  var s = Math.sin(angle);
  var m11 = c*this.m11_ + s*this.m21_;
  var m12 = c*this.m12_ + s*this.m22_;
  var m21 = -s*this.m11_ + c*this.m21_;
  var m22 = -s*this.m12_ + c*this.m22_;
  return new AffineTransform(m11, m12, m21, m22, this.dx_, this.dy_);
};

/**  Concatenates a scaling transformation to this AffineTransform.

The mathematics is as follows: this matrix is on the left, the scaling matrix is on
the right:

    [  m11  m21  dx  ]  [  x   0   0  ]
    [  m12  m22  dy  ]  [  0   y   0  ]
    [   0    0    1  ]  [  0   0   1  ]

Result is:

    [  m11*x  m21*y  dx  ]
    [  m12*x  m22*y  dy  ]
    [   0      0      1  ]


* @param {number} x factor to scale by in horizontal direction
* @param {number} y factor to scale by in vertical direction
* @return {!myphysicslab.lab.util.AffineTransform} a new AffineTransform equal to
*     this AffineTransform scaled by the given x and y factors
*/
AffineTransform.prototype.scale = function(x, y) {
  var m11 = this.m11_ * x;
  var m12 = this.m12_ * x;
  var m21 = this.m21_ * y;
  var m22 = this.m22_ * y;
  return new AffineTransform(m11, m12, m21, m22, this.dx_, this.dy_);
};

/**  Set the affine transform of the given context to match this AffineTransform.
* @param {!CanvasRenderingContext2D} context the canvas context to modify
*/
AffineTransform.prototype.setTransform = function(context) {
  context.setTransform(this.m11_, this.m12_, this.m21_, this.m22_, this.dx_, this.dy_);
};

/**  Apply this transform to the given point, returning the transformation
of the given point.

The mathematics is as follows:

    [  m11  m21  dx  ]  [ x ]
    [  m12  m22  dy  ]  [ y ]
    [   0    0    1  ]  [ 1 ]

Result is:

    [ m11 x + m21 y + dx ]
    [ m12 x + m22 y + dy ]
    [          1         ]

* @param {!Vector|number} x the x coordinate or Vector containing both x and y
* @param {number=} y the y coordinate
* @return {!myphysicslab.lab.util.Vector} the transformation
* of the given point.
*/
AffineTransform.prototype.transform = function(x, y) {
  if (x instanceof Vector) {
    y = x.getY();
    x = x.getX();
  } else if (!goog.isNumber(x) || !goog.isNumber(y)) {
    throw new Error();
  }
  var x2 = this.m11_ * x + this.m21_ * y + this.dx_;
  var y2 = this.m12_ * x + this.m22_ * y + this.dy_;
  return new Vector(x2, y2);
};

/** Concatenates a translation to this AffineTransform.

The mathematics is as follows: this matrix is on the left, the scaling matrix is on
the right:

    [  m11  m21  dx  ]  [  1    0   x  ]
    [  m12  m22  dy  ]  [  0    1   y  ]
    [   0    0    1  ]  [  0    0   1  ]

Result is:

    [ m11  m21  (m11*x + m21*y + dx) ]
    [ m12  m22  (m12*x + m22*y + dy) ]
    [ 0    0            1            ]

* @param {!Vector|number} x the x coordinate or vector
* @param {number=} y the y coordinate
* @return {!myphysicslab.lab.util.AffineTransform} a new AffineTransform equal to
*     this AffineTransform  translated by the given amount
*/
AffineTransform.prototype.translate = function(x, y) {
  if (x instanceof Vector) {
    y = x.getY();
    x = x.getX();
  } else if (!goog.isNumber(x) || !goog.isNumber(y)) {
    throw new Error();
  }
  var dx = this.dx_ + this.m11_*x + this.m21_*y;
  var dy = this.dy_ + this.m12_*x + this.m22_*y;
  return new AffineTransform(this.m11_, this.m12_, this.m21_, this.m22_, dx, dy);
};

}); // goog.scope