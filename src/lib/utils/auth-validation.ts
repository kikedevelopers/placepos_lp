// ---------------------------------------------------------------------------
// Validación de los formularios de cuenta.
//
// Es una réplica EXACTA —campo por campo y mensaje por mensaje— del esquema Zod
// que usa la aplicación de escritorio (`placepos`, `Setup/schema/setup.schema.ts`)
// y de las reglas de contraseña que el servidor aplica en `pos_api`
// (`auth/internal/password-policy.ts`).
//
// Que sea la misma regla en los tres sitios no es una manía: si la web aceptara
// una contraseña que el servidor rechaza, el usuario vería un error genérico
// justo al final del registro sin saber qué corregir; y si aceptara una que la
// app de escritorio rechaza, se quedaría sin poder entrar al programa que
// acaba de descargar.
//
// Sin Zod a propósito: la landing no lo tiene entre sus dependencias y estas
// reglas caben en una función pura que se prueba entera.
// ---------------------------------------------------------------------------

/** Regla de contraseña con el texto tal como se le muestra al usuario. */
export interface PasswordRule {
	key: 'length' | 'uppercase' | 'lowercase' | 'special';
	label: string;
	/** Mensaje de error del formulario (el de la app de escritorio). */
	error: string;
	test: (password: string) => boolean;
}

/**
 * Las cuatro reglas, EN ORDEN. El orden importa: el formulario muestra el
 * primer incumplimiento, igual que Zod, y así los dos dicen lo mismo.
 */
export const PASSWORD_RULES: readonly PasswordRule[] = [
	{
		key: 'length',
		label: 'Mínimo 8 caracteres',
		error: 'La contraseña debe tener al menos 8 caracteres',
		test: (p) => p.length >= 8
	},
	{
		key: 'uppercase',
		label: 'Una letra mayúscula',
		error: 'Debe contener al menos una letra mayúscula',
		test: (p) => /[A-Z]/.test(p)
	},
	{
		key: 'lowercase',
		label: 'Una letra minúscula',
		error: 'Debe contener al menos una letra minúscula',
		test: (p) => /[a-z]/.test(p)
	},
	{
		key: 'special',
		label: 'Un carácter especial',
		error: 'Debe contener al menos un carácter especial',
		test: (p) => /[^A-Za-z0-9]/.test(p)
	}
];

/** Reglas que la contraseña NO cumple, en orden. Vacío = sirve. */
export const failedPasswordRules = (password: string): PasswordRule[] =>
	PASSWORD_RULES.filter((rule) => !rule.test(password));

/**
 * Forma de correo. Deliberadamente permisiva: la única prueba de que una
 * dirección existe es que llegue el correo de activación, y una expresión
 * demasiado estricta rechaza direcciones válidas raras (subdominios, `+`, TLDs
 * largos) que sí reciben.
 */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const isValidEmail = (email: string): boolean => EMAIL_RE.test(email.trim());

export interface RegisterFormValues {
	name: string;
	lastname: string;
	email: string;
	password: string;
	confirmPassword: string;
	company_name: string;
}

export type FormErrors<T> = Partial<Record<keyof T, string>>;

/**
 * Valida el formulario de registro completo y devuelve un error por campo.
 * Objeto vacío = todo bien.
 */
export function validateRegister(values: RegisterFormValues): FormErrors<RegisterFormValues> {
	const errors: FormErrors<RegisterFormValues> = {};

	if (!values.company_name.trim()) {
		errors.company_name = 'El nombre del negocio es requerido';
	}

	if (!values.name.trim()) {
		errors.name = 'El nombre es requerido';
	}

	if (!values.lastname.trim()) {
		errors.lastname = 'El apellido es requerido';
	}

	const email = values.email.trim();
	if (!email) {
		errors.email = 'El correo es requerido';
	} else if (!isValidEmail(email)) {
		errors.email = 'El correo electrónico es inválido';
	}

	// La contraseña NO se recorta: un espacio al principio o al final es parte
	// de la contraseña, y quitárselo aquí crearía una que el servidor no conoce.
	const failed = failedPasswordRules(values.password);
	if (failed.length > 0) {
		errors.password = failed[0].error;
	}

	if (!values.confirmPassword) {
		errors.confirmPassword = 'Confirme la contraseña';
	} else if (values.confirmPassword !== values.password) {
		errors.confirmPassword = 'Las contraseñas no coinciden';
	}

	return errors;
}

export interface LoginFormValues {
	email: string;
	password: string;
}

/**
 * Valida el inicio de sesión.
 *
 * Aquí NO se aplican las reglas de contraseña: quien tiene una cuenta vieja
 * puede tener una contraseña que hoy no pasaría el registro, y negarle el
 * formulario sería dejarlo fuera de su propia cuenta. El único juez de una
 * contraseña existente es el servidor.
 */
export function validateLogin(values: LoginFormValues): FormErrors<LoginFormValues> {
	const errors: FormErrors<LoginFormValues> = {};

	const email = values.email.trim();
	if (!email) {
		errors.email = 'El correo es requerido';
	} else if (!isValidEmail(email)) {
		errors.email = 'El correo electrónico es inválido';
	}

	if (!values.password) {
		errors.password = 'La contraseña es requerida';
	}

	return errors;
}

/** `true` si el objeto de errores no tiene ninguno. */
export const isValid = <T>(errors: FormErrors<T>): boolean => Object.keys(errors).length === 0;
