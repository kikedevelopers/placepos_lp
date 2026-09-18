import { describe, it, expect } from 'vitest';
import {
	PASSWORD_RULES,
	failedPasswordRules,
	isValid,
	isValidEmail,
	validateLogin,
	validateRegister,
	type RegisterFormValues
} from '$lib/utils/auth-validation';

// ---------------------------------------------------------------------------
// Los formularios de cuenta.
//
// Estas reglas están escritas tres veces: aquí, en la app de escritorio y en el
// servidor. La copia es intencional (cada uno valida en su capa), pero solo
// sirve mientras digan LO MISMO. Si la web acepta algo que el servidor rechaza,
// el usuario ve un error genérico al final del registro y no sabe qué corregir;
// si acepta algo que la app de escritorio rechaza, se queda sin poder entrar al
// programa que acaba de instalar.
//
// Por eso los mensajes se prueban literales: son el contrato.
// ---------------------------------------------------------------------------

const validValues = (): RegisterFormValues => ({
	company_name: 'Bodegón Ares',
	name: 'Enrique',
	lastname: 'Pacheco',
	email: 'kike@esenciaygrano.com',
	password: 'Contrasena1!',
	confirmPassword: 'Contrasena1!'
});

describe('registro · camino feliz', () => {
	it('no reporta ningún error con datos válidos', () => {
		expect(validateRegister(validValues())).toEqual({});
		expect(isValid(validateRegister(validValues()))).toBe(true);
	});

	it('acepta nombres con acentos y espacios', () => {
		const errors = validateRegister({
			...validValues(),
			name: 'José María',
			lastname: 'Ñáñez de la Peña',
			company_name: 'Café & Pan #1'
		});
		expect(errors).toEqual({});
	});

	it('no exige recortar: los espacios de más no invalidan el formulario', () => {
		const errors = validateRegister({
			...validValues(),
			name: '  Enrique  ',
			company_name: '  Bodegón  '
		});
		expect(errors).toEqual({});
	});
});

describe('registro · campos obligatorios', () => {
	it('exige el nombre del negocio con su mensaje', () => {
		expect(validateRegister({ ...validValues(), company_name: '' }).company_name).toBe(
			'El nombre del negocio es requerido'
		);
	});

	it('un negocio de solo espacios no cuenta como negocio', () => {
		expect(validateRegister({ ...validValues(), company_name: '   ' }).company_name).toBe(
			'El nombre del negocio es requerido'
		);
	});

	it('exige nombre y apellido con sus mensajes', () => {
		const errors = validateRegister({ ...validValues(), name: '', lastname: '  ' });
		expect(errors.name).toBe('El nombre es requerido');
		expect(errors.lastname).toBe('El apellido es requerido');
	});
});

describe('registro · correo', () => {
	it('exige el correo cuando está vacío', () => {
		expect(validateRegister({ ...validValues(), email: '' }).email).toBe('El correo es requerido');
	});

	it.each([
		'sin-arroba.com',
		'dos@@arrobas.com',
		'sin-dominio@',
		'@sin-usuario.com',
		'con espacio@correo.com',
		'usuario@dominio'
	])('rechaza el correo inválido "%s"', (email) => {
		expect(validateRegister({ ...validValues(), email }).email).toBe(
			'El correo electrónico es inválido'
		);
	});

	it.each([
		'kike@esenciaygrano.com',
		'kike+facturas@sub.dominio.com.co',
		'nombre.apellido@negocio.io',
		'k@x.co'
	])('acepta el correo válido "%s"', (email) => {
		expect(validateRegister({ ...validValues(), email }).email).toBeUndefined();
	});

	it('el correo con espacios alrededor es válido: se recorta al enviarlo', () => {
		expect(isValidEmail('  kike@esenciaygrano.com  ')).toBe(true);
	});
});

describe('registro · contraseña', () => {
	it('las cuatro reglas son las que aplica el servidor, en orden', () => {
		expect(PASSWORD_RULES.map((r) => r.key)).toEqual([
			'length',
			'uppercase',
			'lowercase',
			'special'
		]);
	});

	it.each([
		['Cort1!', 'La contraseña debe tener al menos 8 caracteres'],
		['contrasena1!', 'Debe contener al menos una letra mayúscula'],
		['CONTRASENA1!', 'Debe contener al menos una letra minúscula'],
		['Contrasena12', 'Debe contener al menos un carácter especial']
	])('rechaza "%s" con el mensaje de la app de escritorio', (password, message) => {
		const errors = validateRegister({
			...validValues(),
			password,
			confirmPassword: password
		});
		expect(errors.password).toBe(message);
	});

	it('reporta el PRIMER incumplimiento, no todos a la vez', () => {
		// "abc" falla largo, mayúscula y especial. Se muestra el largo: pedir
		// cuatro cosas a la vez en un solo renglón no ayuda a nadie.
		const errors = validateRegister({ ...validValues(), password: 'abc', confirmPassword: 'abc' });
		expect(errors.password).toBe('La contraseña debe tener al menos 8 caracteres');
		expect(failedPasswordRules('abc').map((r) => r.key)).toEqual([
			'length',
			'uppercase',
			'special'
		]);
	});

	it('la contraseña NO se recorta: los espacios son parte de ella', () => {
		// 8 caracteres contando los espacios. Recortarla aquí crearía una
		// contraseña distinta de la que el servidor va a guardar.
		const password = ' Abc1! ';
		expect(password.length).toBe(7);
		expect(validateRegister({ ...validValues(), password, confirmPassword: password }).password).toBe(
			'La contraseña debe tener al menos 8 caracteres'
		);
		expect(failedPasswordRules(' Abc1!  ')).toEqual([]);
	});

	it('acepta una contraseña larga y compleja', () => {
		const password = 'UnaContrasenaMuyLarga2026#$%';
		expect(
			validateRegister({ ...validValues(), password, confirmPassword: password }).password
		).toBeUndefined();
	});
});

describe('registro · confirmación', () => {
	it('exige confirmar', () => {
		expect(validateRegister({ ...validValues(), confirmPassword: '' }).confirmPassword).toBe(
			'Confirme la contraseña'
		);
	});

	it('detecta que no coinciden', () => {
		expect(
			validateRegister({ ...validValues(), confirmPassword: 'Contrasena2!' }).confirmPassword
		).toBe('Las contraseñas no coinciden');
	});

	it('la diferencia de un solo espacio final cuenta como no coincidir', () => {
		expect(
			validateRegister({ ...validValues(), confirmPassword: 'Contrasena1! ' }).confirmPassword
		).toBe('Las contraseñas no coinciden');
	});

	it('acumula todos los errores del formulario, no solo el primero', () => {
		const errors = validateRegister({
			company_name: '',
			name: '',
			lastname: '',
			email: 'roto',
			password: 'x',
			confirmPassword: ''
		});
		expect(Object.keys(errors).sort()).toEqual([
			'company_name',
			'confirmPassword',
			'email',
			'lastname',
			'name',
			'password'
		]);
		expect(isValid(errors)).toBe(false);
	});
});

describe('inicio de sesión', () => {
	it('acepta credenciales con forma válida', () => {
		expect(validateLogin({ email: 'kike@esenciaygrano.com', password: 'loquesea' })).toEqual({});
	});

	it('exige el correo', () => {
		expect(validateLogin({ email: '  ', password: 'x' }).email).toBe('El correo es requerido');
	});

	it('rechaza un correo con forma inválida', () => {
		expect(validateLogin({ email: 'no-es-correo', password: 'x' }).email).toBe(
			'El correo electrónico es inválido'
		);
	});

	it('exige la contraseña', () => {
		expect(validateLogin({ email: 'kike@esenciaygrano.com', password: '' }).password).toBe(
			'La contraseña es requerida'
		);
	});

	it('NO aplica las reglas de contraseña del registro', () => {
		// Una cuenta vieja puede tener una contraseña que hoy no pasaría el
		// registro. Exigírselo aquí la dejaría fuera de su propia cuenta: el
		// único juez de una contraseña existente es el servidor.
		expect(validateLogin({ email: 'kike@esenciaygrano.com', password: 'abc' })).toEqual({});
	});
});
