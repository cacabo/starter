// import React from 'react'
// import { IRegisterBody } from '../routes/Auth'

// interface IRegisterRequestState {
//   pending: boolean
// }
// type IRegisterState = IRegisterBody & IRegisterRequestState

// interface IInputProps {
//   label?: string
//   placeholder?: string
//   type: 'text' | 'password' | 'number' | 'email'
//   required: boolean
// }

// // TODO type on inputTypes, make it's own component?

// class Register extends React.Component<{}, IRegisterState> {
//   private static inputTypes = {
//     firstName: {
//       label: 'First name',
//       type: 'text',
//       required: true,
//     },
//     lastName: {
//       label: 'Last name',
//       type: 'text',
//       required: true,
//     },
//     email: {
//       label: 'Email',
//       type: 'email',
//       required: true,
//     },
//     password: {
//       label: 'Password',
//       type: 'password',
//       required: true,
//     },
//     confirmPassword: {
//       label: 'Confirm password',
//       type: 'password',
//       required: true,
//     },
//   }

//   constructor(props: {}) {
//     super(props)
//     this.state = {
//       firstName: '',
//       lastName: '',
//       password: '',
//       confirmPassword: '',
//       email: '',
//       pending: false,
//     }
//     this.renderInputTypes = this.renderInputTypes.bind(this)
//     this.handleSubmit = this.handleSubmit.bind(this)
//     this.isDisabled = this.isDisabled.bind(this)
//   }

//   private handleSubmit(event: Event): void {
//     if (this.isDisabled()) {
//       return event.preventDefault()
//     }

//     console.log('submitted')
//   }

//   private isDisabled(): boolean {
//     const { pending } = this.state
//     if (pending) return true

//     const names = Object.keys(Register.inputTypes)
//     names.forEach(name => {
//       const isRequired: boolean = Register.inputTypes[name].required
//       if (isRequired) {
//         const currentValue = this.state[name]
//         if (!currentValue) return true
//       }
//     })

//     return false
//   }

//   private renderInputTypes() {
//     const names: string[] = Object.keys(Register.inputTypes)
//     return names.map((name: string) => {
//       const props: IInputProps = Register.inputTypes[name]
//       return <input {...props} value={this.state[name]} key={name} />
//     })
//   }

//   public render() {
//     return (
//       <div>
//         <h1>Register</h1>
//         {this.renderInputTypes()}
//         <button
//           type="submit"
//           onClick={this.handleSubmit}
//           disabled={this.isDisabled()}
//         >
//           Register
//         </button>
//         <p>
//           Already have an account? <a href="/login">Login here.</a>
//         </p>
//       </div>
//     )
//   }
// }

// export default Register
